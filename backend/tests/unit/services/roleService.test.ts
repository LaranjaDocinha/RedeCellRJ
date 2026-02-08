import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleService } from '../../../src/services/roleService';
import pool from '../../../src/db/index'; // Mockar este módulo
import { AppError } from '../../../src/utils/errors';

// Mock do db
vi.mock('../../../src/db/index', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(() => ({
      query: vi.fn(),
      release: vi.fn(),
    })),
  },
}));

describe('RoleService', () => {
  let mockQuery: vi.Mock; // For pool.query
  let mockClientQuery: vi.Mock; // For client.query in transactions
  let mockClientRelease: vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = pool.query as vi.Mock;
    mockClientQuery = vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }); // Default
    mockClientRelease = vi.fn();

    // Re-mock connect to return a fresh client for each test
    (pool.connect as vi.Mock).mockResolvedValue({
      query: mockClientQuery,
      release: mockClientRelease,
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles with their permissions', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: 'Admin',
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [{ id: 1, action: 'manage', subject: 'all' }],
          },
          { id: 2, name: 'User', created_at: new Date(), updated_at: new Date(), permissions: [] },
        ],
      });
      const roles = await roleService.getAllRoles();
      expect(roles).toHaveLength(2);
      expect(roles[0].name).toBe('Admin');
      expect(roles[0].permissions).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    });
  });

  describe('getRoleById', () => {
    it('should return a role by ID', async () => {
      const mockRole = { id: 1, name: 'Admin', created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValueOnce({ rows: [mockRole] });
      const role = await roleService.getRoleById(1);
      expect(role).toEqual(mockRole);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM roles WHERE id = $1', [1]);
    });

    it('should return undefined if role not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const role = await roleService.getRoleById(999);
      expect(role).toBeUndefined();
    });
  });

  describe('createRole', () => {
    it('should create a new role and assign permissions', async () => {
      const newRoleData = {
        id: 1,
        name: 'New Role',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const newRolePermissions = [{ id: 1, action: 'view', subject: 'products' }];

      mockClientQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [newRoleData] }) // INSERT roles RETURNING *
        .mockResolvedValueOnce({}) // INSERT role_permissions
        .mockResolvedValueOnce({}); // COMMIT

      const newRole = await roleService.createRole({ name: 'New Role', permissionIds: [1, 2] });

      expect(newRole).toEqual(newRoleData); // It returns just the role without fetched permissions
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO roles'), [
        'New Role',
      ]);
      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO role_permissions'),
      );
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockClientRelease).toHaveBeenCalled();
    });

    it('should throw AppError if role name already exists', async () => {
      mockClientQuery.mockResolvedValueOnce({}); // BEGIN
      const error = new Error('Duplicate key');
      (error as any).code = '23505';
      mockClientQuery.mockRejectedValueOnce(error); // INSERT roles fails

      await expect(roleService.createRole({ name: 'Existing Role' })).rejects.toThrow(
        new AppError('Role with this name already exists', 409),
      );
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClientRelease).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update role name and permissions', async () => {
      const updatedRoleData = {
        id: 1,
        name: 'Updated Role',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedPermissions = [{ id: 3, action: 'manage', subject: 'products' }];

      // Mock for internal roleService.getRoleById call
      vi.spyOn(roleService, 'getRoleById').mockResolvedValueOnce({
        ...updatedRoleData,
        permissions: updatedPermissions,
      });

      mockClientQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Updated Role' }], rowCount: 1 }) // UPDATE roles RETURNING *
        .mockResolvedValueOnce({}) // DELETE permissions
        .mockResolvedValueOnce({}) // INSERT permissions
        .mockResolvedValueOnce({}); // COMMIT

      const updatedRole = await roleService.updateRole(1, {
        name: 'Updated Role',
        permissionIds: [3],
      });

      expect(updatedRole?.name).toBe('Updated Role');
      expect(updatedRole?.permissions).toEqual(updatedPermissions);
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE roles'), [
        'Updated Role',
        1,
      ]);
      expect(mockClientQuery).toHaveBeenCalledWith(
        'DELETE FROM role_permissions WHERE role_id = $1',
        [1],
      );
      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO role_permissions'),
      );
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockClientRelease).toHaveBeenCalled();
    });

    it('should return undefined if role not found for update', async () => {
      // Mock getRoleById call at the end
      mockQuery.mockResolvedValueOnce({ rows: [] }); // getRoleById returns undefined

      const updatedRole = await roleService.updateRole(999, { name: 'Non Existent' });
      expect(updatedRole).toBeUndefined();
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT'); // Transação completa mesmo sem update
      expect(mockClientRelease).toHaveBeenCalled();
    });
  });

  describe('deleteRole', () => {
    it('should delete a role by ID', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      const deleted = await roleService.deleteRole(1);
      expect(deleted).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM roles WHERE id = $1 RETURNING id', [1]);
    });

    it('should return false if role not found for deletion', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      const deleted = await roleService.deleteRole(999);
      expect(deleted).toBe(false);
    });
  });

  describe('assignPermissionToRole', () => {
    it('should assign a permission to a role', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      await roleService.assignPermissionToRole(1, 1);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [1, 1],
      );
    });

    it('should throw AppError if permission already assigned', async () => {
      const error = new Error('Duplicate key');
      (error as any).code = '23505';
      mockQuery.mockRejectedValueOnce(error);
      await expect(roleService.assignPermissionToRole(1, 1)).rejects.toThrow(
        new AppError('Permission already assigned to this role', 409),
      );
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove a permission from a role', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      const removed = await roleService.removePermissionFromRole(1, 1);
      expect(removed).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
        [1, 1],
      );
    });

    it('should return false if permission not found for removal', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      const removed = await roleService.removePermissionFromRole(999, 999);
      expect(removed).toBe(false);
    });
  });
});
