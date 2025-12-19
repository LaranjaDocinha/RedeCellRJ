import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
class PermissionService {
    async getAllPermissions() {
        const result = await pool.query('SELECT * FROM permissions');
        return result.rows;
    }
    async getPermissionById(id) {
        const result = await pool.query('SELECT * FROM permissions WHERE id = $1', [id]);
        return result.rows[0];
    }
    async createPermission(payload) {
        const { name } = payload;
        try {
            const result = await pool.query('INSERT INTO permissions (name) VALUES ($1) RETURNING *', [
                name,
            ]);
            return result.rows[0];
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('Permission with this name already exists', 409);
            }
            throw error;
        }
    }
    async updatePermission(id, payload) {
        const { name } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (fields.length === 0) {
            const existingPermission = await this.getPermissionById(id);
            if (!existingPermission) {
                return undefined; // No permission found to update
            }
            return existingPermission; // No fields to update, return existing permission
        }
        values.push(id); // Add id for WHERE clause
        const query = `UPDATE permissions SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('Permission with this name already exists', 409);
            }
            throw error;
        }
    }
    async deletePermission(id) {
        const result = await pool.query('DELETE FROM permissions WHERE id = $1 RETURNING id', [id]);
        return (result?.rowCount ?? 0) > 0;
    }
    async checkUserPermission(userId, permissionName) {
        const res = await pool.query(`SELECT EXISTS (
        SELECT 1
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1 AND p.name = $2
      ) AS has_permission`, [userId, permissionName]);
        return res.rows[0].has_permission;
    }
}
export const permissionService = new PermissionService();
