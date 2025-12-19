import { query } from '../db/index.js';
import { authService } from './authService.js'; // Import authService for password hashing
import * as bcrypt from 'bcrypt';
export const userService = {
    async getAllUsers() {
        try {
            const { rows } = await query(`
        SELECT
          u.id,
          u.name,
          u.email,
          r.name AS role
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        ORDER BY u.name ASC
      `);
            return rows;
        }
        catch (error) {
            console.error('Error in userService.getAllUsers:', error);
            throw error;
        }
    },
    async getUserById(id) {
        const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1;', [
            id,
        ]);
        return rows[0];
    },
    async createUser(userData) {
        const { name, email, password, role = 'user' } = userData;
        if (!password) {
            throw new Error('Password is required for user creation.');
        }
        const { user } = await authService.register(name, email, password, role);
        return user;
    },
    async updateUser(id, userData) {
        const { name, email, password, role } = userData;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (name !== undefined) {
            fields.push(`name = ${paramIndex++}`);
            values.push(name);
        }
        if (email !== undefined) {
            fields.push(`email = ${paramIndex++}`);
            values.push(email);
        }
        if (role !== undefined) {
            fields.push(`role = ${paramIndex++}`);
            values.push(role);
        }
        if (password !== undefined) {
            const password_hash = await bcrypt.hash(password, 10);
            fields.push(`password_hash = ${paramIndex++}`);
            values.push(password_hash);
        }
        if (fields.length === 0)
            return this.getUserById(id); // Nothing to update
        values.push(id); // Add ID for WHERE clause
        const queryText = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ${paramIndex} RETURNING id, name, email, role;`;
        const { rows } = await query(queryText, values);
        return rows[0];
    },
    async deleteUser(id) {
        const result = await query('DELETE FROM users WHERE id = $1;', [id]);
        return (result.rowCount ?? 0) > 0;
    },
};
