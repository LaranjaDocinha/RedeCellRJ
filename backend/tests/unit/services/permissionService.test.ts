import { describe, it, expect, vi, beforeEach } from 'vitest';
import { permissionService } from '../../../src/services/permissionService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do pool do banco de dados
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
      const mockPermissions = [{ id: 1, action: 'read', subject: 'all' }];
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: mockPermissions });

      const result = await permissionService.getAllPermissions();
      expect(result).toEqual(mockPermissions);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM permissions');
    });
  });

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      const payload = { action: 'read', subject: 'users' };
      const mockCreated = { id: 1, ...payload };
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [mockCreated] });

      const result = await permissionService.createPermission(payload);
      expect(result).toEqual(mockCreated);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO permissions'), [
        'read',
        'users',
      ]);
    });

    it('should throw error if action or subject is missing', async () => {
      await expect(
        permissionService.createPermission({ action: '', subject: '' } as any),
      ).rejects.toThrow('Action and Subject are required');
    });

    it('should throw AppError if permission exists (23505)', async () => {
      const dbError = new Error('Duplicate');
      (dbError as any).code = '23505';
      (pool.query as vi.Mock).mockRejectedValueOnce(dbError);

      await expect(
        permissionService.createPermission({ action: 'a', subject: 's' }),
      ).rejects.toThrow('Permission with this action and subject already exists');
    });
  });

  describe('updatePermission', () => {
    it('should update a permission', async () => {
      const mockUpdated = { id: 1, action: 'write', subject: 'users' };
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [mockUpdated] });

      const result = await permissionService.updatePermission(1, { action: 'write' });
      expect(result).toEqual(mockUpdated);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE permissions SET action = $1'),
        ['write', 1],
      );
    });

    it('should return existing if no fields to update', async () => {
      const mockExisting = { id: 1, action: 'read', subject: 'all' };
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [mockExisting] });

      const result = await permissionService.updatePermission(1, {});
      expect(result).toEqual(mockExisting);
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rowCount: 1 });
      const result = await permissionService.deletePermission(1);
      expect(result).toBe(true);
    });

    it('should return false if not found', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rowCount: 0 });
      const result = await permissionService.deletePermission(999);
      expect(result).toBe(false);
    });
  });
});
