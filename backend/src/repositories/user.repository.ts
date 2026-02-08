import { Pool } from 'pg';
import { IRepository } from './base.repository.js';
import { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';

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

  private sanitizeUser(user: any) {
    if (!user) return null;
    const { password_hash: _password_hash, ...sanitized } = user;
    return sanitized;
  }

  async findById(id: string): Promise<Partial<User> | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [
      id,
    ]);
    return this.sanitizeUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<Partial<User> | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email],
    );
    return this.sanitizeUser(result.rows[0]);
  }

  /**
   * Método especial para auth que precisa do hash da senha.
   */
  async findWithPasswordByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email],
    );
    return result.rows[0] || null;
  }

  async findAll(_filter?: Partial<User>): Promise<any[]> {
    const result = await this.db.query(`
      SELECT u.id, u.name, u.email, u.theme_preference, u.xp, u.level, u.failed_login_attempts, u.last_login, u.created_at, u.updated_at, r.name as role 
      FROM users u 
      LEFT JOIN user_roles ur ON u.id = ur.user_id 
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.name ASC
    `);
    return result.rows;
  }

  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await this.db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.email, data.password_hash],
    );
    logger.info(`User created with ID: ${result.rows[0].id}`);
    return result.rows[0];
  }

  async update(
    id: string,
    data: Partial<
      User & { failed_login_attempts?: number; last_login?: Date; deleted_at?: Date | null }
    >,
  ): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = [
      'name',
      'email',
      'password_hash',
      'theme_preference',
      'reset_password_token',
      'reset_password_expires',
      'two_factor_secret',
      'two_factor_enabled',
      'failed_login_attempts',
      'last_login',
      'deleted_at',
    ];

    for (const field of allowedFields) {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(data[field as keyof typeof data]);
      }
    }

    if (fields.length === 0) return this.findById(id) as Promise<User>;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;

    const result = await this.db.query(query, values);
    if (result.rows.length === 0) throw new Error('User not found');
    return result.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    // Implementação de Soft Delete
    const result = await this.db.query('UPDATE users SET deleted_at = NOW() WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  async findUserValidForReset(hashedToken: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
      [hashedToken, new Date()],
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
      [userId],
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
