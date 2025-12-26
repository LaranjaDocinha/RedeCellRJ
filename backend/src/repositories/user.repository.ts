import { Pool } from 'pg';
import { IRepository } from './base.repository';
import { getPool } from '../db';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  two_factor_secret?: string; // Added
  two_factor_enabled?: boolean; // Added
  theme_preference?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: number;
  action: string;
  subject: string;
}

export class UserRepository implements IRepository<User> {
  private get db(): Pool {
    return getPool();
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async findAll(filter?: Partial<User>): Promise<User[]> {
    const result = await this.db.query('SELECT * FROM users');
    return result.rows;
  }

  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await this.db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.email, data.password_hash]
    );
    logger.info(`User created with ID: ${result.rows[0].id}`);
    return result.rows[0];
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Construção dinâmica de query simplificada
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.email) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (data.password_hash) { fields.push(`password_hash = $${idx++}`); values.push(data.password_hash); }
    if (data.theme_preference) { fields.push(`theme_preference = $${idx++}`); values.push(data.theme_preference); }
    if (data.reset_password_token !== undefined) { // Pode ser null
       fields.push(`reset_password_token = $${idx++}`); values.push(data.reset_password_token); 
    }
    if (data.reset_password_expires !== undefined) { 
       fields.push(`reset_password_expires = $${idx++}`); values.push(data.reset_password_expires); 
    }

    if (fields.length === 0) return this.findById(id) as Promise<User>;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  async findUserValidForReset(hashedToken: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
      [hashedToken, new Date()]
    );
    return result.rows[0] || null;
  }

  // Métodos específicos de Auth/Role
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const { rows } = await this.db.query(
      `SELECT p.id, p.action, p.subject
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId],
    );
    return rows;
  }

  async getUserRole(userId: string): Promise<string> {
    const result = await this.db.query(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1`,
      [userId]
    );
    return result.rows[0]?.name || 'user';
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
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
