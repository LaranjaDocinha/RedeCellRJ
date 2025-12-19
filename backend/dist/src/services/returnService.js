import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { inventoryService } from './inventoryService.js';
import { storeCreditService } from './storeCreditService.js';
class ReturnService {
    async createReturn(payload) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { sale_id, reason, items, refund_method } = payload;
            let calculatedRefundAmount = 0;
            const returnItemsDetails = [];
            for (const item of items) {
                const saleItemResult = await client.query('SELECT price FROM sale_items WHERE sale_id = $1 AND variation_id = $2', [sale_id, item.variation_id]);
                if (saleItemResult.rows.length === 0) {
                    throw new AppError(`Item with variation_id ${item.variation_id} not found in sale ${sale_id}`, 404);
                }
                const price = parseFloat(saleItemResult.rows[0].price);
                calculatedRefundAmount += price * item.quantity;
                returnItemsDetails.push({ ...item, price });
            }
            const returnResult = await client.query('INSERT INTO returns (sale_id, reason, refund_amount, status) VALUES ($1, $2, $3, $4) RETURNING *', [sale_id, reason, calculatedRefundAmount, 'pending']);
            const newReturn = returnResult.rows[0];
            for (const detail of returnItemsDetails) {
                await client.query('INSERT INTO return_items (return_id, product_id, variation_id, quantity, price) VALUES ($1, $2, $3, $4, $5)', [newReturn.id, detail.product_id, detail.variation_id, detail.quantity, detail.price]);
            }
            if (refund_method === 'store_credit') {
                const sale = await client.query('SELECT customer_id FROM sales WHERE id = $1', [sale_id]);
                const customerId = sale.rows[0]?.customer_id;
                if (customerId) {
                    await storeCreditService.addCredit(customerId, calculatedRefundAmount, `Refund for return #${newReturn.id}`, newReturn.id);
                }
            }
            await client.query('COMMIT');
            return { ...newReturn, items: returnItemsDetails };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getReturnById(id) {
        const result = await pool.query('SELECT * FROM returns WHERE id = $1', [id]);
        return result.rows[0];
    }
    async getAllReturns() {
        const result = await pool.query('SELECT * FROM returns ORDER BY return_date DESC');
        return result.rows;
    }
    async updateReturn(id, payload) {
        const { reason, status, refund_amount } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (reason !== undefined) {
            fields.push(`reason = $${paramIndex++}`);
            values.push(reason);
        }
        if (status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (refund_amount !== undefined) {
            fields.push(`refund_amount = $${paramIndex++}`);
            values.push(refund_amount);
        }
        if (fields.length === 0) {
            const existingReturn = await this.getReturnById(id);
            if (!existingReturn) {
                return undefined;
            }
            return existingReturn;
        }
        values.push(id);
        const query = `UPDATE returns SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
    }
    async deleteReturn(id) {
        const result = await pool.query('DELETE FROM returns WHERE id = $1 RETURNING id', [id]);
        return (result?.rowCount ?? 0) > 0;
    }
    async getReturnItemById(id) {
        const result = await pool.query('SELECT * FROM return_items WHERE id = $1', [id]);
        return result.rows[0];
    }
    async getPendingInspectionItems() {
        const query = `
                  SELECT
                    ri.id as return_item_id,
                    ri.quantity,
                    ri.inspection_status,
                    r.id as return_id,
                    r.return_date,
                    p.name as product_name,
                    pv.color,
                    c.name as customer_name
                  FROM return_items ri
                  JOIN returns r ON ri.return_id = r.id
                  JOIN products p ON ri.product_id = p.id
                  JOIN product_variations pv ON ri.variation_id = pv.id
                  JOIN sales s ON r.sale_id = s.id
                  LEFT JOIN customers c ON s.customer_id = c.id
                  WHERE ri.inspection_status = 'pending'
                  ORDER BY r.return_date DESC;
                `;
        const result = await pool.query(query);
        return result.rows;
    }
    async inspectReturnItem(returnItemId, inspectionStatus, inspectionNotes, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const itemResult = await client.query('SELECT ri.*, r.sale_id FROM return_items ri JOIN returns r ON ri.return_id = r.id WHERE ri.id = $1', [returnItemId]);
            if (itemResult.rows.length === 0) {
                throw new AppError('Return item not found', 404);
            }
            const item = itemResult.rows[0];
            if (item.inspection_status !== 'pending') {
                throw new AppError('Item has already been inspected', 400);
            }
            if (inspectionStatus === 'approved') {
                const saleItemResult = await client.query('SELECT cost_at_sale FROM sale_items WHERE sale_id = $1 AND variation_id = $2', [item.sale_id, item.variation_id]);
                const unitCost = saleItemResult.rows[0]?.cost_at_sale || 0;
                await inventoryService.receiveStock(item.variation_id, item.quantity, unitCost, userId, client);
            }
            const updateQuery = `
                      UPDATE return_items
                      SET
                        inspection_status = $1,
                        inspection_notes = $2,
                        resolved_at = current_timestamp
                      WHERE id = $3
                      RETURNING *;
                    `;
            const updatedItemResult = await client.query(updateQuery, [
                inspectionStatus,
                inspectionNotes,
                returnItemId,
            ]);
            await client.query('COMMIT');
            return updatedItemResult.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
export const returnService = new ReturnService();
