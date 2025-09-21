import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { inventoryService } from './inventoryService.js'; // Import inventoryService

interface ReturnItemInput {
  product_id: number;
  variation_id: number;
  quantity: number;
}

interface CreateReturnPayload {
  sale_id: number;
  reason?: string;
  items: ReturnItemInput[];
}

interface UpdateReturnPayload {
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  refund_amount?: number;
}

interface ReturnRecord {
  id: number;
  sale_id: number;
  return_date: Date;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refund_amount: number;
  created_at: Date;
  updated_at: Date;
  items?: any[]; // To include return items when fetched
}

class ReturnService {
  async getAllReturns(): Promise<ReturnRecord[]> {
    const result = await pool.query('SELECT * FROM returns');
    return result.rows;
  }

  async getReturnById(id: number): Promise<ReturnRecord | undefined> {
    const returnResult = await pool.query('SELECT * FROM returns WHERE id = $1', [id]);
    if (returnResult.rows.length === 0) return undefined;

    const returnRecord = returnResult.rows[0];
    const itemsResult = await pool.query('SELECT * FROM return_items WHERE return_id = $1', [id]);
    returnRecord.items = itemsResult.rows;

    return returnRecord;
  }

  async createReturn(payload: CreateReturnPayload): Promise<ReturnRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { sale_id, reason, items } = payload;

      // Fetch sale details to calculate refund amount
      const saleResult = await client.query('SELECT total_amount FROM sales WHERE id = $1', [sale_id]);
      if (saleResult.rows.length === 0) {
        throw new AppError('Sale not found', 404);
      }
      const saleTotalAmount = parseFloat(saleResult.rows[0].total_amount);

      let calculatedRefundAmount = 0;
      const returnItemsDetails = [];

      for (const item of items) {
        // Fetch product variation price at the time of sale (or current price if not available)
        const saleItemResult = await client.query(
          'SELECT price_at_sale FROM sale_items WHERE sale_id = $1 AND product_id = $2 AND variation_id = $3',
          [sale_id, item.product_id, item.variation_id]
        );

        let priceAtReturn = 0;
        if (saleItemResult.rows.length > 0) {
          priceAtReturn = parseFloat(saleItemResult.rows[0].price_at_sale);
        } else {
          // Fallback to current product variation price if not found in sale_items
          const currentPriceResult = await client.query(
            'SELECT price FROM product_variations WHERE product_id = $1 AND id = $2',
            [item.product_id, item.variation_id]
          );
          if (currentPriceResult.rows.length === 0) {
            throw new AppError(`Product variation ${item.variation_id} not found.`, 404);
          }
          priceAtReturn = parseFloat(currentPriceResult.rows[0].price);
        }

        calculatedRefundAmount += priceAtReturn * item.quantity;
        returnItemsDetails.push({ ...item, price_at_return: priceAtReturn });

        // Restock item in inventory
        await inventoryService.adjustStock(item.variation_id, item.quantity); // Add quantity back to stock
      }

      // Insert return record
      const returnResult = await client.query(
        'INSERT INTO returns (sale_id, reason, refund_amount, status) VALUES ($1, $2, $3, $4) RETURNING *'
        , [sale_id, reason, calculatedRefundAmount, 'pending']
      );
      const newReturn = returnResult.rows[0];

      // Insert return items
      for (const itemDetail of returnItemsDetails) {
        await client.query(
          'INSERT INTO return_items (return_id, product_id, variation_id, quantity, price_at_return) VALUES ($1, $2, $3, $4, $5)',
          [newReturn.id, itemDetail.product_id, itemDetail.variation_id, itemDetail.quantity, itemDetail.price_at_return]
        );
      }

      await client.query('COMMIT');
      return { ...newReturn, items: returnItemsDetails };
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

  async updateReturn(id: number, payload: UpdateReturnPayload): Promise<ReturnRecord | undefined> {
    const { reason, status, refund_amount } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (reason !== undefined) { fields.push(`reason = $${paramIndex++}`); values.push(reason); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }
    if (refund_amount !== undefined) { fields.push(`refund_amount = $${paramIndex++}`); values.push(refund_amount); }

    if (fields.length === 0) {
      const existingReturn = await this.getReturnById(id);
      if (!existingReturn) {
        return undefined; // No return found to update
      }
      return existingReturn; // No fields to update, return existing return
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE returns SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  }

  async deleteReturn(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM returns WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const returnService = new ReturnService();