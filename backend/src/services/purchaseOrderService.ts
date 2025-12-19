import { inventoryService } from './inventoryService.js';

import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface PurchaseOrder {
  id: number;
  supplier_id: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

interface PurchaseOrderItem {
  product_variation_id: number;
  quantity: number;
  unit_price: number;
}

interface CreatePurchaseOrderPayload {
  supplier_id: number;
  items: PurchaseOrderItem[];
}

interface UpdatePurchaseOrderPayload {
  supplier_id?: number;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  items?: PurchaseOrderItem[];
}

class PurchaseOrderService {
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    const result = await pool.query('SELECT * FROM purchase_orders ORDER BY created_at DESC');
    return result.rows;
  }

  async getPurchaseOrderById(id: number): Promise<PurchaseOrder | undefined> {
    const result = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { supplier_id, items } = payload;
      const orderResult = await client.query(
        'INSERT INTO purchase_orders (supplier_id, status) VALUES ($1, $2) RETURNING *',
        [supplier_id, 'pending'],
      );
      const newOrder = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          'INSERT INTO purchase_order_items (purchase_order_id, product_variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [newOrder.id, item.product_variation_id, item.quantity, item.unit_price],
        );
      }

      await client.query('COMMIT');
      return newOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updatePurchaseOrder(
    id: number,
    payload: UpdatePurchaseOrderPayload,
  ): Promise<PurchaseOrder | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { supplier_id, status, items } = payload;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (supplier_id !== undefined) {
        fields.push(`supplier_id = $${paramIndex++}`);
        values.push(supplier_id);
      }
      if (status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(status);
      }

      if (fields.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE purchase_orders SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`,
          values,
        );
      }

      if (items !== undefined) {
        await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
        for (const item of items) {
          await client.query(
            'INSERT INTO purchase_order_items (purchase_order_id, product_variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
            [id, item.product_variation_id, item.quantity, item.unit_price],
          );
        }
      }

      await client.query('COMMIT');
      return this.getPurchaseOrderById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
      const result = await client.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING id', [
        id,
      ]);
      await client.query('COMMIT');
      return (result?.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async receivePurchaseOrderItems(
    orderId: number,
    items: PurchaseOrderItem[],
    userId?: string,
  ): Promise<PurchaseOrder | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        'SELECT * FROM purchase_orders WHERE id = $1 FOR UPDATE',
        [orderId],
      );
      const order = orderResult.rows[0];

      if (!order) {
        throw new AppError(`Purchase order ${orderId} not found.`, 404);
      }
      if (order.status !== 'ordered') {
        throw new AppError(
          `Purchase order ${orderId} is not in 'ordered' status. Current status: ${order.status}`,
          400,
        );
      }

      const orderItemsResult = await client.query(
        'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1',
        [orderId],
      );
      const orderItems = orderItemsResult.rows;

      for (const receivedItem of items) {
        const originalItem = orderItems.find(
          (item) => item.product_variation_id === receivedItem.product_variation_id,
        );

        if (!originalItem) {
          throw new AppError(
            `Item (product_variation_id: ${receivedItem.product_variation_id}) not found in purchase order ${orderId}.`,
            400,
          );
        }

        // Use inventoryService to correctly handle stock-in and record cost
        await inventoryService.receiveStock(
          receivedItem.product_variation_id,
          receivedItem.quantity,
          originalItem.unit_price, // Use the cost from the original PO
          userId,
          client,
        );
      }

      // Mark the PO as 'received'
      await client.query(
        'UPDATE purchase_orders SET status = $1, updated_at = current_timestamp WHERE id = $2',
        ['received', orderId],
      );

      await client.query('COMMIT');
      return this.getPurchaseOrderById(orderId);
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error receiving purchase order items', 500, error);
    } finally {
      client.release();
    }
  }
}

export const purchaseOrderService = new PurchaseOrderService();
