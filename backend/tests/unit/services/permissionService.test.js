import { describe, it, expect, vi, beforeEach } from 'vitest';
import { permissionService } from '../../../src/services/permissionService';
import pool from '../../../src/db/index'; // Mockar este módulo
import { AppError } from '../../../src/utils/errors';
vi.mock('../../../src/db/index', () => ({
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
            pool.query.mockResolvedValueOnce({
                rows: [
                    { id: 1, action: 'manage', subject: 'all' },
                    { id: 2, action: 'view', subject: 'reports' },
                ],
            });
            const permissions = await permissionService.getAllPermissions();
            expect(permissions).toHaveLength(2);
            expect(permissions[0].action).toBe('manage');
        });
    });
    describe('getPermissionById', () => {
        it('should return a permission by ID', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ id: 1, action: 'manage', subject: 'all' }],
            });
            const permission = await permissionService.getPermissionById(1);
            expect(permission?.action).toBe('manage');
        });
        it('should return undefined if permission not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            const permission = await permissionService.getPermissionById(999);
            expect(permission).toBeUndefined();
        });
    });
    describe('createPermission', () => {
        it('should create a new permission', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ id: 3, action: 'create', subject: 'users' }],
            });
            const newPermission = await permissionService.createPermission({
                action: 'create',
                subject: 'users',
            });
            expect(newPermission.action).toBe('create');
            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO permissions'), [
                'create',
                'users',
            ]);
        });
        it('should throw AppError if permission already exists', async () => {
            const error = new Error('Duplicate key');
            error.code = '23505';
            pool.query.mockRejectedValueOnce(error);
            await expect(permissionService.createPermission({ action: 'manage', subject: 'all' })).rejects.toThrow(new AppError('Permission with this action and subject already exists', 409));
        });
    });
    describe('updatePermission', () => {
        it('should update a permission', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ id: 1, action: 'manage', subject: 'products' }],
            });
            const updatedPermission = await permissionService.updatePermission(1, {
                subject: 'products',
            });
            expect(updatedPermission?.subject).toBe('products');
            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE permissions'), [
                'products',
                1,
            ]);
        });
        it('should return undefined if permission not found for update', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            const updatedPermission = await permissionService.updatePermission(999, {
                subject: 'nonexistent',
            });
            expect(updatedPermission).toBeUndefined();
        });
    });
    describe('deletePermission', () => {
        it('should delete a permission by ID', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 });
            const deleted = await permissionService.deletePermission(1);
            expect(deleted).toBe(true);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM permissions WHERE id = $1 RETURNING id', [1]);
        });
        it('should return false if permission not found for deletion', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0 });
            const deleted = await permissionService.deletePermission(999);
            expect(deleted).toBe(false);
        });
    });
});
