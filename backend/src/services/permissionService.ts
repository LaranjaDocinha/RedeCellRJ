import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Permission {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface CreatePermissionPayload {
  name: string;
}

interface UpdatePermissionPayload {
  name?: string;
}

class PermissionService {
  async getAllPermissions(): Promise<Permission[]> {
    const result = await pool.query('SELECT * FROM permissions');
    return result.rows;
  }

  async getPermissionById(id: number): Promise<Permission | undefined> {
    const result = await pool.query('SELECT * FROM permissions WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createPermission(payload: CreatePermissionPayload): Promise<Permission> {
    const { name } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO permissions (name) VALUES ($1) RETURNING *',
        [name]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Permission with this name already exists', 409);
      }
      throw error;
    }
  }

  async updatePermission(id: number, payload: UpdatePermissionPayload): Promise<Permission | undefined> {
    const { name } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }

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
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Permission with this name already exists', 409);
      }
      throw error;
    }
  }

  async deletePermission(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM permissions WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const permissionService = new PermissionService();