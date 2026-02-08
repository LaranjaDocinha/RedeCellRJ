import pool from '../db/index.js';
import { ServiceOrder, ServiceOrderItem, ServiceOrderStatus } from '../types/serviceOrder.js';
import * as purchaseAutomationService from './purchaseAutomationService.js';
import { permissionService } from './permissionService.js';
import * as activityFeedService from './activityFeedService.js';
import appEvents from '../events/appEvents.js';
import { serviceOrderRepository } from '../repositories/serviceOrder.repository.js';
import { partRepository } from '../repositories/part.repository.js';
import { invalidateCache } from '../middlewares/cacheMiddleware.js';
import { auditLogger } from '../utils/auditLogger.js';

export const serviceOrderService = {
  // Create a new service order
  async createServiceOrder(orderData: any): Promise<ServiceOrder> {
    const { user_id } = orderData;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const initialStatus: ServiceOrderStatus = 'Aguardando Avaliação';

      const userRes = await client.query('SELECT branch_id FROM users WHERE id = $1', [user_id]);
      const branchId = userRes.rows[0]?.branch_id || 1;

      const newOrder = await serviceOrderRepository.create(
        {
          ...orderData,
          status: initialStatus,
          branch_id: branchId,
        },
        client,
      );

      await serviceOrderRepository.addStatusHistory(
        {
          service_order_id: newOrder.id,
          new_status: initialStatus,
          changed_by_user_id: user_id,
        },
        client,
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
  },

  // Get all service orders with filtering
  async getAllServiceOrders(filters: {
    status?: string;
    customer_id?: number;
    customer_name?: string;
  }): Promise<ServiceOrder[]> {
    return serviceOrderRepository.findAll(filters);
  },

  // Get a single service order by ID
  async getServiceOrderById(
    id: number,
  ): Promise<(ServiceOrder & { items: ServiceOrderItem[] }) | null> {
    const order = await serviceOrderRepository.findById(id);
    if (!order) {
      return null;
    }

    const items = await serviceOrderRepository.getItems(id);
    const attachments = await serviceOrderRepository.getAttachments(id);

    return { ...order, items, attachments };
  },

  // Add an item to a service order
  async addOrderItem(
    service_order_id: number,
    itemData: Omit<ServiceOrderItem, 'id' | 'created_at' | 'service_order_id'>,
  ): Promise<ServiceOrderItem> {
    const { part_id, quantity } = itemData;

    if (part_id) {
      const stockQuantity = await partRepository.checkStock(part_id);
      if (stockQuantity < quantity) {
        await purchaseAutomationService.checkAndRequestPartsForServiceOrder(service_order_id);
      }
    }

    return serviceOrderRepository.addItem({
      service_order_id,
      ...itemData,
    });
  },

  // Update a service order
  async updateServiceOrder(
    id: number,
    orderData: Partial<Pick<ServiceOrder, 'technical_report' | 'budget_value'>>,
  ): Promise<ServiceOrder | null> {
    return serviceOrderRepository.update(id, orderData);
  },

  async updateServiceOrderStatusFromKanban(
    serviceOrderId: number,
    newStatus: ServiceOrderStatus,
    changedBy: string,
    externalClient?: any,
  ): Promise<ServiceOrder | null> {
    const client = externalClient || (await pool.connect());
    try {
      if (!externalClient) await client.query('BEGIN');

      const oldOrder = await serviceOrderRepository.findByIdForUpdate(serviceOrderId, client);
      if (!oldOrder) {
        throw new Error('Service order not found');
      }
      const oldStatus = oldOrder.status;

      const updatedOrder = await serviceOrderRepository.updateStatus(
        serviceOrderId,
        newStatus,
        client,
      );

      await serviceOrderRepository.addStatusHistory(
        {
          service_order_id: serviceOrderId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by_user_id: changedBy,
        },
        client,
      );

      appEvents.emit('os.status.updated', {
        serviceOrder: updatedOrder,
        oldStatus,
        newStatus,
        changedBy: changedBy,
      });

      // Invalidate public portal cache
      if (updatedOrder.public_token) {
        await invalidateCache(`portal-order:*${updatedOrder.public_token}*`);
      }

      if (!externalClient) await client.query('COMMIT');
      return updatedOrder || null;
    } catch (error) {
      if (!externalClient) await client.query('ROLLBACK');
      throw error;
    } finally {
      if (!externalClient) client.release();
    }
  },

  // Change the status of a service order
  async changeOrderStatus(
    id: number,
    newStatus: ServiceOrderStatus,
    userId: string,
  ): Promise<ServiceOrder | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const oldOrder = await serviceOrderRepository.findByIdForUpdate(id, client);
      if (!oldOrder) {
        throw new Error('Service order not found');
      }
      const oldStatus = oldOrder.status;

      if (newStatus === 'Aguardando QA') {
        if (oldStatus !== 'Em Reparo' && oldStatus !== 'Aguardando Peça') {
          throw new Error(
            'Service order can only go to "Aguardando QA" from "Em Reparo" or "Aguardando Peça" status.',
          );
        }
      } else if (newStatus === 'Finalizado' || newStatus === 'Não Aprovado') {
        if (oldStatus === 'Aguardando QA') {
          const hasQAPermission = await permissionService.checkUserPermission(userId, 'perform_qa');
          if (!hasQAPermission) {
            throw new Error('User does not have permission to finalize/reject QA.');
          }
        } else {
          throw new Error('Service order must pass QA before being finalized or rejected.');
        }
      }

      const updatedOrder = await serviceOrderRepository.updateStatus(id, newStatus, client);

      // Auditoria Temporal (Enterprise)
      await auditLogger.logUpdate('service_orders', id, oldOrder, updatedOrder, client, { userId });

      await serviceOrderRepository.addStatusHistory(
        {
          service_order_id: id,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by_user_id: userId,
        },
        client,
      );

      if (newStatus === 'Finalizado') {
        const itemsResult = await client.query(
          'SELECT * FROM service_order_items WHERE service_order_id = $1 AND part_id IS NOT NULL',
          [id],
        );

        for (const item of itemsResult.rows) {
          await partRepository.updateStock(item.part_id, -item.quantity, client);
        }

        await purchaseAutomationService.checkAndRequestPartsForServiceOrder(id);

        try {
          await activityFeedService.createActivity(
            updatedOrder.user_id,
            updatedOrder.branch_id,
            'repair_completed',
            { serviceOrderId: id, productDescription: updatedOrder.product_description },
            client,
          );
        } catch (feedError) {
          console.error('Error adding to activity feed:', feedError);
        }
      }

      appEvents.emit('os.status.updated', {
        serviceOrder: updatedOrder,
        oldStatus,
        newStatus,
        changedBy: userId,
      });

      // Invalidate public portal cache
      if (updatedOrder.public_token) {
        await invalidateCache(`portal-order:*${updatedOrder.public_token}*`);
      }

      await client.query('COMMIT');
      return updatedOrder || null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateEntryChecklist(serviceOrderId: number, checklist: any) {
    const client = await pool.connect();
    try {
      // Single update, but using client allows future expansion or hooks
      return await serviceOrderRepository.updateChecklist(serviceOrderId, checklist, client);
    } finally {
      client.release();
    }
  },

  async suggestTechnician(serviceOrderId: number): Promise<any[]> {
    const order = await serviceOrderRepository.findById(serviceOrderId);
    if (!order) throw new Error('Order not found');
    const orderTags: string[] = order.tags || [];

    if (orderTags.length === 0) {
      return serviceOrderRepository.findTechnicianLoad();
    }

    return serviceOrderRepository.findTechniciansBySkill(orderTags);
  },

  async addComment(serviceOrderId: number, userId: string, commentText: string) {
    return serviceOrderRepository.addComment({
      service_order_id: serviceOrderId,
      user_id: userId,
      comment_text: commentText,
    });
  },

  async getComments(serviceOrderId: number) {
    return serviceOrderRepository.getComments(serviceOrderId);
  },

  async addServiceOrderAttachment(
    serviceOrderId: number,
    filePath: string,
    fileType: string,
    description: string | null,
    uploadedByUserId: string,
  ) {
    return serviceOrderRepository.addAttachment({
      service_order_id: serviceOrderId,
      file_path: filePath,
      file_type: fileType,
      description: description,
      uploaded_by_user_id: uploadedByUserId,
    });
  },
};
