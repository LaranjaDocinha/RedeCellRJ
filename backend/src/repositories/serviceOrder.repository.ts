import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';
import { ServiceOrder, ServiceOrderItem, ServiceOrderStatus } from '../types/serviceOrder.js';

export interface ServiceOrderFilters {
  status?: string;
  customer_id?: number;
  customer_name?: string;
}

export class ServiceOrderRepository {
  private get db(): Pool {
    return getPool();
  }

  async create(data: any, client: PoolClient): Promise<ServiceOrder> {
    const {
      customer_id,
      user_id,
      product_description,
      brand,
      imei,
      device_password,
      issue_description,
      services,
      observations,
      down_payment,
      part_quality,
      expected_delivery_date,
      status,
      priority,
      branch_id,
      estimated_cost,
      entry_checklist,
    } = data;

    const result = await client.query(
      `INSERT INTO service_orders (
        customer_id, user_id, product_description, brand, imei, 
        device_password, issue_description, services, observations, down_payment, 
        part_quality, expected_delivery_date, status, priority, branch_id,
        estimated_cost, entry_checklist
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        customer_id || null,
        user_id,
        product_description,
        brand,
        imei || null,
        device_password || null,
        issue_description,
        services ? JSON.stringify(services) : null,
        observations || null,
        down_payment || 0,
        part_quality || 'Premium',
        expected_delivery_date || null,
        status,
        priority || 'normal',
        branch_id,
        estimated_cost || null,
        entry_checklist ? JSON.stringify(entry_checklist) : null,
      ],
    );
    return result.rows[0];
  }

  async findAll(filters: ServiceOrderFilters): Promise<ServiceOrder[]> {
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

    const result = await this.db.query(queryText, queryParams);
    return result.rows;
  }

  async findById(id: number, client?: PoolClient): Promise<ServiceOrder | null> {
    const executor = client || this.db;
    const result = await executor.query('SELECT * FROM service_orders WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByIdForUpdate(id: number, client: PoolClient): Promise<ServiceOrder | null> {
    const result = await client.query('SELECT * FROM service_orders WHERE id = $1 FOR UPDATE', [
      id,
    ]);
    return result.rows[0] || null;
  }

  async getItems(serviceOrderId: number): Promise<ServiceOrderItem[]> {
    const result = await this.db.query(
      'SELECT * FROM service_order_items WHERE service_order_id = $1',
      [serviceOrderId],
    );
    return result.rows;
  }

  async getAttachments(serviceOrderId: number): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM service_order_attachments WHERE service_order_id = $1',
      [serviceOrderId],
    );
    return result.rows;
  }

  async addItem(data: any, client?: PoolClient): Promise<ServiceOrderItem> {
    const executor = client || this.db;
    const result = await executor.query(
      'INSERT INTO service_order_items (service_order_id, part_id, service_description, quantity, unit_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        data.service_order_id,
        data.part_id,
        data.service_description,
        data.quantity,
        data.unit_price,
      ],
    );
    return result.rows[0];
  }

  async update(
    id: number,
    data: Partial<ServiceOrder>,
    client?: PoolClient,
  ): Promise<ServiceOrder | null> {
    const executor = client || this.db;
    // Simplified update for specific fields used in service
    if (data.technical_report !== undefined || data.budget_value !== undefined) {
      const result = await executor.query(
        'UPDATE service_orders SET technical_report = $1, budget_value = $2, updated_at = current_timestamp WHERE id = $3 RETURNING *',
        [data.technical_report, data.budget_value, id],
      );
      return result.rows[0];
    }
    return null;
  }

  async updateStatus(
    id: number,
    status: ServiceOrderStatus,
    client: PoolClient,
  ): Promise<ServiceOrder> {
    const result = await client.query(
      'UPDATE service_orders SET status = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *',
      [status, id],
    );
    return result.rows[0];
  }

  async addStatusHistory(data: any, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO service_order_status_history (service_order_id, old_status, new_status, changed_by_user_id) VALUES ($1, $2, $3, $4)',
      [data.service_order_id, data.old_status || null, data.new_status, data.changed_by_user_id],
    );
  }

  async addComment(data: any): Promise<any> {
    const result = await this.db.query(
      'INSERT INTO service_order_comments (service_order_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
      [data.service_order_id, data.user_id, data.comment_text],
    );
    return result.rows[0];
  }

  async getComments(serviceOrderId: number): Promise<any[]> {
    const result = await this.db.query(
      'SELECT soc.*, u.name as user_name FROM service_order_comments soc JOIN users u ON soc.user_id = u.id WHERE service_order_id = $1 ORDER BY created_at ASC',
      [serviceOrderId],
    );
    return result.rows;
  }

  async addAttachment(data: any): Promise<any> {
    const result = await this.db.query(
      'INSERT INTO service_order_attachments (service_order_id, file_path, file_type, description, uploaded_by_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        data.service_order_id,
        data.file_path,
        data.file_type,
        data.description,
        data.uploaded_by_user_id,
      ],
    );
    return result.rows[0];
  }

  async updateChecklist(id: number, checklist: any, client: PoolClient): Promise<ServiceOrder> {
    const result = await client.query(
      'UPDATE service_orders SET entry_checklist = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *',
      [checklist, id],
    );
    return result.rows[0];
  }

  async findTechnicianLoad(): Promise<any[]> {
    const result = await this.db.query(`
            SELECT
                u.id,
                u.name,
                (SELECT COUNT(*) FROM service_orders so WHERE so.technician_id = u.id AND so.status NOT IN ('Finalizado', 'Entregue')) as open_orders_count
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'technician'
            ORDER BY open_orders_count ASC;
      `);
    return result.rows;
  }

  async findTechniciansBySkill(tags: string[]): Promise<any[]> {
    const result = await this.db.query(
      `
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
    `,
      [tags],
    );
    return result.rows;
  }
}

export const serviceOrderRepository = new ServiceOrderRepository();
