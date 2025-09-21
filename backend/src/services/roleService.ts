import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Role {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateRolePayload {
  name: string;
}

interface UpdateRolePayload {
  name?: string;
}

class RoleService {
  async getAllRoles(): Promise<Role[]> {
    const result = await pool.query('SELECT * FROM roles');
    return result.rows;
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createRole(payload: CreateRolePayload): Promise<Role> {
    const { name } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO roles (name) VALUES ($1) RETURNING *'
        , [name]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Role with this name already exists', 409);
      }
      throw error;
    }
  }

  async updateRole(id: number, payload: UpdateRolePayload): Promise<Role | undefined> {
    const { name } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }

    if (fields.length === 0) {
      const existingRole = await this.getRoleById(id);
      if (!existingRole) {
        return undefined; // No role found to update
      }
      return existingRole; // No fields to update, return existing role
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE roles SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Role with this name already exists', 409);
      }
      throw error;
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    try {
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [roleId, permissionId]
      );
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Permission already assigned to this role', 409);
      }
      throw error;
    }
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );
    return (result?.rowCount ?? 0) > 0;
  }
}

export const roleService = new RoleService();