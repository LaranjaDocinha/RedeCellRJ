import { Request, Response, NextFunction } from 'express';
import { getPool } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const pool = getPool();

// --- Role Management ---
export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [id, name, description],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await pool.query(
      'UPDATE roles SET name = $1, description = $2, updated_at = current_timestamp WHERE id = $3 RETURNING *',
      [name, description, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found.' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Permission Management (simplified for now) ---
export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real system, permissions would likely be hardcoded or managed in a more complex way.
    // For this placeholder, we'll return a static list.
    const permissions = [
      {
        id: 'view_dashboard',
        name: 'View Dashboard',
        description: 'Allows viewing the main dashboard.',
      },
      {
        id: 'manage_products',
        name: 'Manage Products',
        description: 'Allows creating, editing, and deleting products.',
      },
      {
        id: 'manage_users',
        name: 'Manage Users',
        description: 'Allows creating, editing, and deleting users.',
      },
      { id: 'create_sales', name: 'Create Sales', description: 'Allows creating new sales.' },
      // ... more permissions
    ];
    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

// --- Role-Permission Assignment ---
export const assignPermissionToRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId, permissionId } = req.body;
    // Assuming a role_permissions join table exists
    await pool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT (role_id, permission_id) DO NOTHING',
      [roleId, permissionId],
    );
    res.status(200).json({ message: 'Permission assigned to role successfully.' });
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId, permissionId } = req.body;
    await pool.query('DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2', [
      roleId,
      permissionId,
    ]);
    res.status(200).json({ message: 'Permission removed from role successfully.' });
  } catch (error) {
    next(error);
  }
};
