import { describe, it, expect, vi, beforeEach } from 'vitest';
import { permissionService } from '../../../src/services/permissionService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('PermissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'manage_users' },
          { id: 2, name: 'view_reports' },
        ],
      });
      const permissions = await permissionService.getAllPermissions();
      expect(permissions).toHaveLength(2);
      expect(permissions[0].name).toBe('manage_users');
    });
  });

  describe('getPermissionById', () => {
    it('should return a permission by ID', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, name: 'manage_users' }],
      });
      const permission = await permissionService.getPermissionById(1);
      expect(permission?.name).toBe('manage_users');
    });

    it('should return undefined if permission not found', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [] });
      const permission = await permissionService.getPermissionById(999);
      expect(permission).toBeUndefined();
    });
  });

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({
        rows: [{ id: 3, name: 'create_users' }],
      });
      
      const newPermission = await permissionService.createPermission({
        name: 'create_users',
      });
      expect(newPermission.name).toBe('create_users');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO permissions (name) VALUES ($1) RETURNING *'), 
        ['create_users']
      );
    });

    it('should throw AppError if permission already exists', async () => {
      const error = new Error('Duplicate key');
      (error as any).code = '23505';
      (pool.query as vi.Mock).mockRejectedValueOnce(error);
      await expect(
        permissionService.createPermission({ name: 'manage_users' }),
      ).rejects.toThrow(
        new AppError('Permission with this name already exists', 409),
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('DB Error');
      (pool.query as vi.Mock).mockRejectedValueOnce(error);
      await expect(
        permissionService.createPermission({ name: 'test' }),
      ).rejects.toThrow(error);
    });
  });

  describe('updatePermission', () => {
    it('should update a permission', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, name: 'manage_products' }],
      });
      
      const updatedPermission = await permissionService.updatePermission(1, {
        name: 'manage_products',
      });
      expect(updatedPermission?.name).toBe('manage_products');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE permissions SET name = $1'), [
        'manage_products',
        1,
      ]);
    });

    it('should return undefined if permission not found for update (with fields)', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [] });
      
      const updatedPermission = await permissionService.updatePermission(999, {
        name: 'nonexistent',
      });
      expect(updatedPermission).toBeUndefined();
    });

    it('should return existing permission if no fields to update', async () => {
      const mockPermission = { id: 1, name: 'original' };
      // mock getPermissionById call
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [mockPermission] });

      const result = await permissionService.updatePermission(1, {});
      
      expect(result).toEqual(mockPermission);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM permissions'), [1]);
      expect(pool.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE'));
    });

    it('should return undefined if no fields to update and permission not found', async () => {
        // mock getPermissionById call returning empty
        (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [] });
  
        const result = await permissionService.updatePermission(999, {});
        
        expect(result).toBeUndefined();
      });

    it('should throw AppError if update causes duplicate name', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        (pool.query as vi.Mock).mockRejectedValueOnce(error);
  
        await expect(
          permissionService.updatePermission(1, { name: 'duplicate' }),
        ).rejects.toThrow(
          new AppError('Permission with this name already exists', 409),
        );
    });

    it('should rethrow other errors on update', async () => {
        const error = new Error('DB Error');
        (pool.query as vi.Mock).mockRejectedValueOnce(error);
  
        await expect(
          permissionService.updatePermission(1, { name: 'error' }),
        ).rejects.toThrow(error);
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission by ID', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rowCount: 1 });
      const deleted = await permissionService.deletePermission(1);
      expect(deleted).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM permissions WHERE id = $1 RETURNING id',
        [1],
      );
    });

    it('should return false if permission not found for deletion', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rowCount: 0 });
      const deleted = await permissionService.deletePermission(999);
      expect(deleted).toBe(false);
    });
  });

  describe('checkUserPermission', () => {
    it('should return true if user has permission', async () => {
        (pool.query as vi.Mock).mockResolvedValueOnce({
            rows: [{ has_permission: true }]
        });

        const hasPermission = await permissionService.checkUserPermission(1, 'admin');
        expect(hasPermission).toBe(true);
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT EXISTS'), [1, 'admin']);
    });

    it('should return false if user does not have permission', async () => {
        (pool.query as vi.Mock).mockResolvedValueOnce({
            rows: [{ has_permission: false }]
        });

        const hasPermission = await permissionService.checkUserPermission(1, 'superadmin');
        expect(hasPermission).toBe(false);
    });
  });
});
