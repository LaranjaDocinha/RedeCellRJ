import { query, connect } from '../db/index.js';
import { ServiceOrder, ServiceOrderItem, ServiceOrderStatus } from '../types/serviceOrder.js';
import * as purchaseAutomationService from './purchaseAutomationService.js';
import { permissionService } from './permissionService.js';
import * as activityFeedService from './activityFeedService.js';
import appEvents from '../events/appEvents.js';

// Create a new service order
export const createServiceOrder = async (
  orderData: any,
): Promise<ServiceOrder> => {
  const { 
    customer_id, 
    user_id, 
    product_description, 
    brand,
    imei, 
    issue_description, 
    services, 
    observations, 
    down_payment, 
    part_quality, 
    expected_delivery_date,
    priority 
  } = orderData;

  const client = await connect();
  try {
    await client.query('BEGIN');
    const initialStatus: ServiceOrderStatus = 'Aguardando Avaliação';

    // Fetch user's branch_id to ensure consistency
    const userRes = await client.query('SELECT branch_id FROM users WHERE id = $1', [user_id]);
    const branchId = userRes.rows[0]?.branch_id || 1; // Fallback to 1 if not set

    const orderResult = await client.query(
      `INSERT INTO service_orders (
        customer_id, user_id, product_description, brand, imei, 
        issue_description, services, observations, down_payment, 
        part_quality, expected_delivery_date, status, priority, branch_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        customer_id || null,
        user_id,
        product_description,
        brand,
        imei || null,
        issue_description,
        JSON.stringify(services),
        observations || null,
        down_payment || 0,
        part_quality || 'Premium',
        expected_delivery_date || null,
        initialStatus,
        priority || 'normal',
        branchId
      ],
    );
    const newOrder = orderResult.rows[0];

    await client.query(
      'INSERT INTO service_order_status_history (service_order_id, new_status, changed_by_user_id) VALUES ($1, $2, $3)',
      [newOrder.id, initialStatus, user_id],
    );

    await client.query('COMMIT');
    return newOrder;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('CRITICAL ERROR in createServiceOrder:', error.message, error.stack);
    throw new Error(`Erro ao salvar Ordem de Serviço: ${error.message}`);
  } finally {
    client.release();
  }
};

// Get all service orders with filtering
export const getAllServiceOrders = async (filters: {
  status?: string;
  customer_id?: number;
  customer_name?: string;
}): Promise<ServiceOrder[]> => {
  let queryText = `
    SELECT
      so.*,
      c.name AS customer_name,
      u.name AS technician_name
    FROM service_orders so
    LEFT JOIN customers c ON so.customer_id = c.id
    LEFT JOIN users u ON so.user_id = u.id
  `;
  const queryParams: any[] = [];
  const whereClauses: string[] = [];

  if (filters.status) {
    queryParams.push(filters.status);
    whereClauses.push(`so.status = $${queryParams.length}`);
  }
  if (filters.customer_id) {
    queryParams.push(filters.customer_id);
    whereClauses.push(`so.customer_id = $${queryParams.length}`);
  }
  if (filters.customer_name) {
    queryParams.push(`%${filters.customer_name}%`);
    whereClauses.push(`c.name ILIKE $${queryParams.length}`);
  }

  if (whereClauses.length > 0) {
    queryText += ' WHERE ' + whereClauses.join(' AND ');
  }

  queryText += ' ORDER BY so.created_at DESC';

  const result = await query(queryText, queryParams);
  return result.rows;
};

// Get a single service order by ID, including items and attachments
export const getServiceOrderById = async (
  id: number,
): Promise<(ServiceOrder & { items: ServiceOrderItem[] }) | null> => {
  const orderResult = await query('SELECT * FROM service_orders WHERE id = $1', [id]);
  if (orderResult.rows.length === 0) {
    return null;
  }
  const order = orderResult.rows[0];

  const itemsResult = await query(
    'SELECT * FROM service_order_items WHERE service_order_id = $1',
    [id],
  );
  order.items = itemsResult.rows;

  const attachmentsResult = await query(
    'SELECT * FROM service_order_attachments WHERE service_order_id = $1',
    [id],
  );
  order.attachments = attachmentsResult.rows;

  return order;
};

// Add an item to a service order
export const addOrderItem = async (
  service_order_id: number,
  itemData: Omit<ServiceOrderItem, 'id' | 'created_at' | 'service_order_id'>,
): Promise<ServiceOrderItem> => {
  const { part_id, service_description, quantity, unit_price } = itemData;

  // Check stock if it's a part and request if needed
  if (part_id) {
    const stockCheck = await query('SELECT stock_quantity FROM parts WHERE id = $1', [
      part_id,
    ]);
    if (stockCheck.rows[0] && stockCheck.rows[0].stock_quantity < quantity) {
      // Call the automation service to check and request parts
      await purchaseAutomationService.checkAndRequestPartsForServiceOrder(service_order_id);
    }
  }

  const result = await query(
    'INSERT INTO service_order_items (service_order_id, part_id, service_description, quantity, unit_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [service_order_id, part_id, service_description, quantity, unit_price],
  );
  return result.rows[0];
};

// Update a service order (e.g., add technical report, budget)
export const updateServiceOrder = async (
  id: number,
  orderData: Partial<Pick<ServiceOrder, 'technical_report' | 'budget_value'>>,
): Promise<ServiceOrder | null> => {
  const { technical_report, budget_value } = orderData;
  const result = await query(
    'UPDATE service_orders SET technical_report = $1, budget_value = $2, updated_at = current_timestamp WHERE id = $3 RETURNING *',
    [technical_report, budget_value, id],
  );
  return result.rows[0] || null;
};

export const updateServiceOrderStatusFromKanban = async (
  serviceOrderId: number,
  newStatus: ServiceOrderStatus,
  changedBy: string, // User ID or 'System Kanban'
  externalClient?: any // Optional: pass client if already in a transaction
): Promise<ServiceOrder | null> => {
  const client = externalClient || (await connect());
  try {
    if (!externalClient) await client.query('BEGIN');

    const oldOrderResult = await client.query(
      'SELECT status FROM service_orders WHERE id = $1 FOR UPDATE',
      [serviceOrderId],
    );
    if (oldOrderResult.rows.length === 0) {
      throw new Error('Service order not found');
    }
    const oldStatus = oldOrderResult.rows[0].status;

    const updatedOrderResult = await client.query(
      'UPDATE service_orders SET status = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *',
      [newStatus, serviceOrderId],
    );

    await client.query(
      'INSERT INTO service_order_status_history (service_order_id, old_status, new_status, changed_by_user_id) VALUES ($1, $2, $3, $4)',
      [serviceOrderId, oldStatus, newStatus, changedBy],
    );

    const updatedOrder = updatedOrderResult.rows[0];
    appEvents.emit('os.status.updated', {
      serviceOrder: updatedOrder,
      oldStatus,
      newStatus,
      changedBy: changedBy,
    });

    if (!externalClient) await client.query('COMMIT');
    return updatedOrder || null;
  } catch (error) {
    if (!externalClient) await client.query('ROLLBACK');
    throw error;
  } finally {
    if (!externalClient) client.release();
  }
};


// Change the status of a service order
export const changeOrderStatus = async (
  id: number,
  newStatus: ServiceOrderStatus,
  userId: string,
): Promise<ServiceOrder | null> => {
  const client = await connect();
  try {
    await client.query('BEGIN');

    const oldOrderResult = await client.query(
      'SELECT status FROM service_orders WHERE id = $1 FOR UPDATE',
      [id],
    );
    if (oldOrderResult.rows.length === 0) {
      throw new Error('Service order not found');
    }
    const oldStatus = oldOrderResult.rows[0].status;

    // Lógica de transição de status para QA
    if (newStatus === 'Aguardando QA') {
      if (oldStatus !== 'Em Reparo' && oldStatus !== 'Aguardando Peça') {
        throw new Error(
          'Service order can only go to "Aguardando QA" from "Em Reparo" or "Aguardando Peça" status.',
        );
      }
    } else if (newStatus === 'Finalizado' || newStatus === 'Não Aprovado') {
      if (oldStatus === 'Aguardando QA') {
        // Verificar permissão para QA
        const hasQAPermission = await permissionService.checkUserPermission(userId, 'perform_qa'); // Assumindo uma permissão 'perform_qa'
        if (!hasQAPermission) {
          throw new Error('User does not have permission to finalize/reject QA.');
        }
      } else {
        throw new Error('Service order must pass QA before being finalized or rejected.');
      }
    }

    const updatedOrderResult = await client.query(
      'UPDATE service_orders SET status = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *',
      [newStatus, id],
    );

    await client.query(
      'INSERT INTO service_order_status_history (service_order_id, old_status, new_status, changed_by_user_id) VALUES ($1, $2, $3, $4)',
      [id, oldStatus, newStatus, userId],
    );

    if (newStatus === 'Finalizado') {
      const itemsResult = await client.query(
        'SELECT * FROM service_order_items WHERE service_order_id = $1 AND part_id IS NOT NULL',
        [id],
      );
      for (const item of itemsResult.rows) {
        await client.query('UPDATE parts SET stock_quantity = stock_quantity - $1 WHERE id = $2', [
          item.quantity,
          item.part_id,
        ]);
      }
      // Check and request parts after stock update
      await purchaseAutomationService.checkAndRequestPartsForServiceOrder(id);

      // Add to activity feed
      try {
        const order = updatedOrderResult.rows[0];
        await activityFeedService.createActivity(
          order.user_id,
          order.branch_id,
          'repair_completed',
          { serviceOrderId: id, productDescription: order.product_description },
        );
      } catch (feedError) {
        console.error('Error adding to activity feed:', feedError);
      }
    }

    const updatedOrder = updatedOrderResult.rows[0];
    appEvents.emit('os.status.updated', {
      serviceOrder: updatedOrder,
      oldStatus,
      newStatus,
      changedBy: userId,
    });

    await client.query('COMMIT');
    return updatedOrder || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


// Suggest a technician for a service order
export const suggestTechnician = async (serviceOrderId: number): Promise<any[]> => {
  const orderRes = await query('SELECT tags FROM service_orders WHERE id = $1', [
    serviceOrderId,
  ]);
  if (orderRes.rows.length === 0) throw new Error('Order not found');
  const orderTags: string[] = orderRes.rows[0].tags || [];

  // Se não houver tags na ordem, retornar todos os técnicos com menor carga de trabalho
  if (orderTags.length === 0) {
    const techniciansWithoutTagsQuery = `
            SELECT
                u.id,
                u.name,
                (SELECT COUNT(*) FROM service_orders so WHERE so.technician_id = u.id AND so.status NOT IN ('Finalizado', 'Entregue')) as open_orders_count
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'technician'
            ORDER BY open_orders_count ASC;
        `;
    const technicians = await query(techniciansWithoutTagsQuery);
    return technicians.rows;
  }

  const queryText = `
        SELECT
            u.id,
            u.name,
            COUNT(DISTINCT s.id) as skill_match_count,
            (SELECT COUNT(*) FROM service_orders so WHERE so.technician_id = u.id AND so.status NOT IN ('Finalizado', 'Entregue')) as open_orders_count
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        LEFT JOIN user_skills us ON u.id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.id
        WHERE r.name = 'technician' AND s.name = ANY($1::text[])
        GROUP BY u.id, u.name
        ORDER BY skill_match_count DESC, open_orders_count ASC;
    `;

  const suggestions = await query(queryText, [orderTags]);
  return suggestions.rows;
};

export const addComment = async (serviceOrderId: number, userId: string, commentText: string) => {
  const result = await query(
    'INSERT INTO service_order_comments (service_order_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
    [serviceOrderId, userId, commentText],
  );
  return result.rows[0];
};

export const getComments = async (serviceOrderId: number) => {
  const result = await query(
    'SELECT soc.*, u.name as user_name FROM service_order_comments soc JOIN users u ON soc.user_id = u.id WHERE service_order_id = $1 ORDER BY created_at ASC',
    [serviceOrderId],
  );
  return result.rows;
};

export const addServiceOrderAttachment = async (
  serviceOrderId: number,
  filePath: string,
  fileType: string,
  description: string | null,
  uploadedByUserId: string,
) => {
  const res = await query(
    'INSERT INTO service_order_attachments (service_order_id, file_path, file_type, description, uploaded_by_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [serviceOrderId, filePath, fileType, description, uploadedByUserId],
  );
  return res.rows[0];
};
