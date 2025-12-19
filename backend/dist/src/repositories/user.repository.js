import { getPool } from '../db';
import { logger } from '../utils/logger';
export class UserRepository {
    get db() {
        return getPool();
    }
    async findById(id) {
        const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    async findByEmail(email) {
        const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    async findAll(filter) {
        const result = await this.db.query('SELECT * FROM users');
        return result.rows;
    }
    async create(data) {
        const result = await this.db.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *', [data.name, data.email, data.password_hash]);
        logger.info(`User created with ID: ${result.rows[0].id}`);
        return result.rows[0];
    }
    async update(id, data) {
        // Construção dinâmica de query simplificada
        const fields = [];
        const values = [];
        let idx = 1;
        if (data.name) {
            fields.push(`name = $${idx++}`);
            values.push(data.name);
        }
        if (data.email) {
            fields.push(`email = $${idx++}`);
            values.push(data.email);
        }
        if (data.password_hash) {
            fields.push(`password_hash = $${idx++}`);
            values.push(data.password_hash);
        }
        if (data.reset_password_token !== undefined) { // Pode ser null
            fields.push(`reset_password_token = $${idx++}`);
            values.push(data.reset_password_token);
        }
        if (data.reset_password_expires !== undefined) {
            fields.push(`reset_password_expires = $${idx++}`);
            values.push(data.reset_password_expires);
        }
        if (fields.length === 0)
            return this.findById(id);
        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await this.db.query(query, values);
        return result.rows[0];
    }
    async delete(id) {
        const result = await this.db.query('DELETE FROM users WHERE id = $1', [id]);
        return (result.rowCount || 0) > 0;
    }
    async findUserValidForReset(hashedToken) {
        const result = await this.db.query('SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2', [hashedToken, new Date()]);
        return result.rows[0] || null;
    }
    // Métodos específicos de Auth/Role
    async getUserPermissions(userId) {
        const { rows } = await this.db.query(`SELECT p.id, p.action, p.subject
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`, [userId]);
        return rows;
    }
    async getUserRole(userId) {
        const result = await this.db.query(`SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1`, [userId]);
        return result.rows[0]?.name || 'user';
    }
    async assignRole(userId, roleName) {
        const roleResult = await this.db.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleResult.rows.length === 0) {
            throw new Error(`Role '${roleName}' not found`);
        }
        const roleId = roleResult.rows[0].id;
        await this.db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
            userId,
            roleId,
        ]);
    }
}
export const userRepository = new UserRepository();
