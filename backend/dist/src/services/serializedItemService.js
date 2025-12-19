import pool from '../db/index.js';
export const serializedItemService = {
    async createSerializedItem(payload) {
        const { serial_number, product_variation_id, branch_id, status, userId } = payload;
        const result = await pool.query('INSERT INTO serialized_items (serial_number, product_variation_id, branch_id, status) VALUES ($1, $2, $3, $4) RETURNING *', [serial_number, product_variation_id, branch_id, status || 'in_stock']);
        const newItem = result.rows[0];
        await this.logHistory(newItem.id, 'entry', null, newItem.status, userId || null, { initial: true });
        return newItem;
    },
    async getSerializedItemById(id) {
        const result = await pool.query('SELECT * FROM serialized_items WHERE id = $1', [id]);
        return result.rows[0];
    },
    async getSerializedItemBySerialNumber(serialNumber) {
        const result = await pool.query('SELECT * FROM serialized_items WHERE serial_number = $1', [
            serialNumber,
        ]);
        return result.rows[0];
    },
    async getAllSerializedItems() {
        const result = await pool.query('SELECT * FROM serialized_items ORDER BY created_at DESC');
        return result.rows;
    },
    async getSerializedItemsByVariationId(productVariationId) {
        const result = await pool.query('SELECT * FROM serialized_items WHERE product_variation_id = $1 ORDER BY serial_number', [productVariationId]);
        return result.rows;
    },
    async updateSerializedItem(id, payload) {
        const { serial_number, product_variation_id, branch_id, status, userId, actionReason, relatedId } = payload;
        const existingItem = await this.getSerializedItemById(id);
        if (!existingItem)
            return undefined;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (serial_number !== undefined) {
            fields.push(`serial_number = $${paramIndex++}`);
            values.push(serial_number);
        }
        if (product_variation_id !== undefined) {
            fields.push(`product_variation_id = $${paramIndex++}`);
            values.push(product_variation_id);
        }
        if (branch_id !== undefined) {
            fields.push(`branch_id = $${paramIndex++}`);
            values.push(branch_id);
        }
        if (status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (fields.length === 0) {
            return existingItem;
        }
        values.push(id);
        const query = `UPDATE serialized_items SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        const updatedItem = result.rows[0];
        // Log history if status changed
        if (status && status !== existingItem.status) {
            await this.logHistory(id, actionReason || 'status_change', existingItem.status, status, userId || null, { relatedId });
        }
        return updatedItem;
    },
    async deleteSerializedItem(id) {
        const result = await pool.query('DELETE FROM serialized_items WHERE id = $1 RETURNING id', [
            id,
        ]);
        return (result?.rowCount ?? 0) > 0;
    },
    async getHistory(serialNumber) {
        const item = await this.getSerializedItemBySerialNumber(serialNumber);
        if (!item)
            return [];
        const result = await pool.query('SELECT * FROM serialized_items_history WHERE serialized_item_id = $1 ORDER BY created_at DESC', [item.id]);
        return result.rows;
    },
    async logHistory(serializedItemId, action, oldStatus, newStatus, userId, details) {
        await pool.query('INSERT INTO serialized_items_history (serialized_item_id, action, old_status, new_status, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)', [serializedItemId, action, oldStatus, newStatus, userId, details]);
    }
};
