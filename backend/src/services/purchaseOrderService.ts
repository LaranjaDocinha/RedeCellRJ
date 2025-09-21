import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface PurchaseOrderItem {
  product_id: number;
  variation_id: number;
  quantity: number;
  unit_price: number;
}

interface PurchaseOrder {
  id: number;
  supplier_id: number;
  order_date: Date;
  expected_delivery_date?: Date;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  created_at: Date;
  updated_at: Date;
  items?: PurchaseOrderItem[];
}

interface CreatePurchaseOrderPayload {
  supplier_id: number;
  expected_delivery_date?: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
}

interface UpdatePurchaseOrderPayload {
  supplier_id?: number;
  expected_delivery_date?: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  items?: PurchaseOrderItem[];
}

class PurchaseOrderService {
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    const result = await pool.query('SELECT * FROM purchase_orders');
    return result.rows;
  }

  async getPurchaseOrderById(id: number): Promise<PurchaseOrder | undefined> {
    const orderResult = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) return undefined;

    const order = orderResult.rows[0];
    const itemsResult = await pool.query('SELECT product_id, variation_id, quantity, unit_price FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
    order.items = itemsResult.rows;

    return order;
  }

  async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { supplier_id, expected_delivery_date, status, items } = payload;
      let total_amount = 0; // Calculate total amount from items

      for (const item of items) {
        total_amount += item.quantity * item.unit_price;
      }

      const orderResult = await client.query(
        'INSERT INTO purchase_orders (supplier_id, expected_delivery_date, status, total_amount) VALUES ($1, $2, $3, $4) RETURNING *'
        , [supplier_id, expected_delivery_date, status || 'pending', total_amount]
      );
      const newOrder = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          'INSERT INTO purchase_order_items (purchase_order_id, product_id, variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)'
          , [newOrder.id, item.product_id, item.variation_id, item.quantity, item.unit_price]
        );
      }

      await client.query('COMMIT');
      return { ...newOrder, items };
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async updatePurchaseOrder(id: number, payload: UpdatePurchaseOrderPayload): Promise<PurchaseOrder | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { supplier_id, expected_delivery_date, status, items } = payload;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (supplier_id !== undefined) { fields.push(`supplier_id = $${paramIndex++}`); values.push(supplier_id); }
      if (expected_delivery_date !== undefined) { fields.push(`expected_delivery_date = $${paramIndex++}`); values.push(expected_delivery_date); }
      if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }

      if (fields.length > 0) {
        values.push(id); // Add id for WHERE clause
        const query = `UPDATE purchase_orders SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        await client.query(query, values);
      }

      if (items !== undefined) {
        // Delete existing order items
        await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
        // Insert new order items
        let newTotalAmount = 0;
        for (const item of items) {
          newTotalAmount += item.quantity * item.unit_price;
          await client.query(
            'INSERT INTO purchase_order_items (purchase_order_id, product_id, variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)'
            , [id, item.product_id, item.variation_id, item.quantity, item.unit_price]
          );
        }
        // Update total_amount in purchase_orders table
        await client.query('UPDATE purchase_orders SET total_amount = $1 WHERE id = $2', [newTotalAmount, id]);
      }

      const updatedOrder = await this.getPurchaseOrderById(id);
      await client.query('COMMIT');
      return updatedOrder;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
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
      const result = await client.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING id', [id]);
      await client.query('COMMIT');
      return (result?.rowCount ?? 0) > 0;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async receivePurchaseOrderItems(orderId: number, items: PurchaseOrderItem[]): Promise<PurchaseOrder | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verificar se a ordem de compra existe e está no status 'ordered'
      const order = await this.getPurchaseOrderById(orderId);
      if (!order) {
        throw new AppError(`Purchase order ${orderId} not found.`, 404);
      }
      if (order.status !== 'ordered') {
        throw new AppError(`Purchase order ${orderId} is not in 'ordered' status. Current status: ${order.status}`, 400);
      }

      // 2. Atualizar o estoque dos produtos recebidos
      for (const receivedItem of items) {
        // Verificar se o item recebido faz parte da ordem de compra original
        const originalItem = order.items?.find(item =>
          item.product_id === receivedItem.product_id && item.variation_id === receivedItem.variation_id
        );

        if (!originalItem) {
          throw new AppError(`Item (product_id: ${receivedItem.product_id}, variation_id: ${receivedItem.variation_id}) not found in purchase order ${orderId}.`, 400);
        }

        // Atualizar estoque da variação do produto
        await client.query(
          'UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE product_id = $2 AND id = $3',
          [receivedItem.quantity, receivedItem.product_id, receivedItem.variation_id]
        );
      }

      // 3. Atualizar o status da ordem de compra para 'received'
      await client.query(
        'UPDATE purchase_orders SET status = $1, updated_at = current_timestamp WHERE id = $2',
        ['received', orderId]
      );

      await client.query('COMMIT');
      return await this.getPurchaseOrderById(orderId); // Retornar a ordem de compra atualizada
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

export const purchaseOrderService = new PurchaseOrderService();