import pool from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
export const ipWhitelistService = {
    async getAllEntries() {
        const result = await pool.query('SELECT * FROM ip_whitelist ORDER BY ip_address ASC');
        return result.rows;
    },
    async getEntryByIp(ipAddress) {
        const result = await pool.query('SELECT * FROM ip_whitelist WHERE ip_address = $1', [ipAddress]);
        return result.rows[0];
    },
    async createEntry(payload) {
        const { ip_address, description, is_active = true } = payload;
        try {
            const result = await pool.query('INSERT INTO ip_whitelist (ip_address, description, is_active) VALUES ($1, $2, $3) RETURNING *', [ip_address, description, is_active]);
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new AppError(`IP address ${ip_address} already exists in whitelist.`, 409);
            }
            throw new AppError('Failed to create IP whitelist entry.', 500);
        }
    },
    async updateEntry(id, payload) {
        const { ip_address, description, is_active } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (ip_address !== undefined) {
            fields.push(`ip_address = $${paramIndex++}`);
            values.push(ip_address);
        }
        if (description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (is_active !== undefined) {
            fields.push(`is_active = $${paramIndex++}`);
            values.push(is_active);
        }
        if (fields.length === 0) {
            const existing = await this.getEntryById(id);
            if (!existing)
                throw new NotFoundError('IP whitelist entry not found.');
            return existing; // No fields to update
        }
        values.push(id);
        const query = `UPDATE ip_whitelist SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            throw new NotFoundError('IP whitelist entry not found.');
        }
        return result.rows[0];
    },
    async deleteEntry(id) {
        const result = await pool.query('DELETE FROM ip_whitelist WHERE id = $1', [id]);
        return result.rowCount > 0;
    },
    async getEntryById(id) {
        const result = await pool.query('SELECT * FROM ip_whitelist WHERE id = $1', [id]);
        return result.rows[0];
    },
    async getActiveWhitelistedIps() {
        const result = await pool.query('SELECT ip_address FROM ip_whitelist WHERE is_active = TRUE');
        return result.rows.map(row => row.ip_address);
    }
};
