import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Permission {
  id: number;
  action: string;
  subject: string;
}

interface Role {
  id: number;
  name: string;
  permissions?: Permission[]; // Adicionado para incluir permissões
  created_at: Date;
  updated_at: Date;
}

interface CreateRolePayload {
  name: string;
  permissionIds?: number[];
}

interface UpdateRolePayload {
  name?: string;
  permissionIds?: number[];
}

class RoleService {
  async getAllRoles(): Promise<Role[]> {
    const result = await pool.query(`
      SELECT
          r.id,
          r.name,
          r.created_at,
          r.updated_at,
          COALESCE(json_agg(json_build_object('id', p.id, 'action', p.action, 'subject', p.subject)) FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
      FROM
          roles r
      LEFT JOIN
          role_permissions rp ON r.id = rp.role_id
      LEFT JOIN
          permissions p ON rp.permission_id = p.id
      GROUP BY
          r.id, r.name, r.created_at, r.updated_at
      ORDER BY
          r.name;
    `);
    return result.rows;
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createRole(payload: CreateRolePayload): Promise<Role> {
    const { name, permissionIds } = payload;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const roleResult = await client.query(
        'INSERT INTO roles (name) VALUES ($1) RETURNING id, name, created_at, updated_at', // Retornar colunas necessárias para Role
        [name],
      );
      const newRole: Role = roleResult.rows[0];

      if (permissionIds && permissionIds.length > 0) {
        const permissionValues = permissionIds
          .map((pId: number) => `(${newRole.id}, ${pId})`)
          .join(',');
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ${permissionValues}`,
        );
      }
      await client.query('COMMIT');
      return newRole;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        // Unique violation error code
        throw new AppError('Role with this name already exists', 409);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async updateRole(id: number, payload: UpdateRolePayload): Promise<Role | undefined> {
    const { name, permissionIds } = payload;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(name);
      }

      if (fields.length > 0) {
        // Only update if there are name changes
        values.push(id); // Add id for WHERE clause
        const query = `UPDATE roles SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        await client.query(query, values);
      }

      if (permissionIds !== undefined) {
        // Only update permissions if provided
        await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
        if (permissionIds.length > 0) {
          const permissionValues = permissionIds.map((pId: number) => `(${id}, ${pId})`).join(',');
          await client.query(
            `INSERT INTO role_permissions (role_id, permission_id) VALUES ${permissionValues}`,
          );
        }
      }
      await client.query('COMMIT');
      // Fetch the updated role with permissions to return
      const updatedRole = await this.getRoleById(id); // Using the service's own method
      return updatedRole;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        // Unique violation error code
        throw new AppError('Role with this name already exists', 409);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    try {
      await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [
        roleId,
        permissionId,
      ]);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        // Unique violation error code
        throw new AppError('Permission already assigned to this role', 409);
      }
      throw error;
    }
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId],
    );
    return (result?.rowCount ?? 0) > 0;
  }
}

export const roleService = new RoleService();
