import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleService } from '../../../src/services/roleService';
import pool from '../../../src/db/index'; // Mockar este módulo
import { AppError } from '../../../src/utils/errors';
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
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('getAllRoles', () => {
        it('should return all roles with their permissions', async () => {
            pool.query.mockResolvedValueOnce({
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
        });
    });
    describe('getRoleById', () => {
        it('should return a role by ID', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ id: 1, name: 'Admin', created_at: new Date(), updated_at: new Date() }],
            });
            const role = await roleService.getRoleById(1);
            expect(role?.name).toBe('Admin');
        });
        it('should return undefined if role not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            const role = await roleService.getRoleById(999);
            expect(role).toBeUndefined();
        });
    });
    describe('createRole', () => {
        it('should create a new role and assign permissions', async () => {
            const mockClient = {
                query: vi.fn((sql) => {
                    if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
                        return Promise.resolve();
                    }
                    if (sql.includes('INSERT INTO roles')) {
                        return Promise.resolve({
                            rows: [{ id: 1, name: 'New Role', created_at: new Date(), updated_at: new Date() }],
                        });
                    }
                    if (sql.includes('INSERT INTO role_permissions')) {
                        return Promise.resolve();
                    }
                    return Promise.resolve({ rows: [] });
                }),
                release: vi.fn(),
            };
            pool.connect.mockResolvedValueOnce(mockClient);
            const newRole = await roleService.createRole({ name: 'New Role', permissionIds: [1, 2] });
            expect(newRole.name).toBe('New Role');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO roles'), [
                'New Role',
            ]);
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO role_permissions'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
        });
        it('should throw AppError if role name already exists', async () => {
            const mockClient = {
                query: vi.fn((sql) => {
                    if (sql.includes('BEGIN') || sql.includes('ROLLBACK')) {
                        return Promise.resolve();
                    }
                    if (sql.includes('INSERT INTO roles')) {
                        const error = new Error('Duplicate key');
                        error.code = '23505';
                        return Promise.reject(error);
                    }
                    return Promise.resolve({ rows: [] });
                }),
                release: vi.fn(),
            };
            pool.connect.mockResolvedValueOnce(mockClient);
            await expect(roleService.createRole({ name: 'Existing Role' })).rejects.toThrow(new AppError('Role with this name already exists', 409));
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        });
    });
    describe('updateRole', () => {
        it('should update role name and permissions', async () => {
            const mockClient = {
                query: vi.fn((sql) => {
                    if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
                        return Promise.resolve();
                    }
                    if (sql.includes('UPDATE roles')) {
                        return Promise.resolve({
                            rows: [
                                { id: 1, name: 'Updated Role', created_at: new Date(), updated_at: new Date() },
                            ],
                        });
                    }
                    if (sql.includes('DELETE FROM role_permissions')) {
                        return Promise.resolve();
                    }
                    if (sql.includes('INSERT INTO role_permissions')) {
                        return Promise.resolve();
                    }
                    if (sql.includes('SELECT * FROM roles WHERE id = $1')) {
                        // For getRoleById call
                        return Promise.resolve({
                            rows: [
                                {
                                    id: 1,
                                    name: 'Updated Role',
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    permissions: [{ id: 3, action: 'view', subject: 'reports' }],
                                },
                            ],
                        });
                    }
                    return Promise.resolve({ rows: [] });
                }),
                release: vi.fn(),
            };
            pool.connect.mockResolvedValueOnce(mockClient);
            roleService.getRoleById = vi.fn().mockResolvedValueOnce({
                id: 1,
                name: 'Updated Role',
                created_at: new Date(),
                updated_at: new Date(),
                permissions: [{ id: 3, action: 'view', subject: 'reports' }],
            });
            const updatedRole = await roleService.updateRole(1, {
                name: 'Updated Role',
                permissionIds: [3],
            });
            expect(updatedRole?.name).toBe('Updated Role');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE roles'), [
                'Updated Role',
                1,
            ]);
            expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM role_permissions WHERE role_id = $1', [1]);
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO role_permissions'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
        });
        it('should return undefined if role not found for update', async () => {
            const mockClient = {
                query: vi.fn((sql) => {
                    if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
                        return Promise.resolve();
                    }
                    if (sql.includes('UPDATE roles')) {
                        return Promise.resolve({ rowCount: 0 }); // Simulate no role found
                    }
                    return Promise.resolve({ rows: [] });
                }),
                release: vi.fn(),
            };
            pool.connect.mockResolvedValueOnce(mockClient);
            roleService.getRoleById = vi.fn().mockResolvedValueOnce(undefined); // Mock getRoleById to return undefined
            const updatedRole = await roleService.updateRole(999, { name: 'Non Existent' });
            expect(updatedRole).toBeUndefined();
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK'); // Should rollback if getRoleById fails
        });
    });
    describe('deleteRole', () => {
        it('should delete a role by ID', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 });
            const deleted = await roleService.deleteRole(1);
            expect(deleted).toBe(true);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM roles WHERE id = $1 RETURNING id', [1]);
        });
        it('should return false if role not found for deletion', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0 });
            const deleted = await roleService.deleteRole(999);
            expect(deleted).toBe(false);
        });
    });
    describe('assignPermissionToRole', () => {
        it('should assign a permission to a role', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 });
            await roleService.assignPermissionToRole(1, 1);
            expect(pool.query).toHaveBeenCalledWith('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [1, 1]);
        });
        it('should throw AppError if permission already assigned', async () => {
            const error = new Error('Duplicate key');
            error.code = '23505';
            pool.query.mockRejectedValueOnce(error);
            await expect(roleService.assignPermissionToRole(1, 1)).rejects.toThrow(new AppError('Permission already assigned to this role', 409));
        });
    });
    describe('removePermissionFromRole', () => {
        it('should remove a permission from a role', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 });
            const removed = await roleService.removePermissionFromRole(1, 1);
            expect(removed).toBe(true);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2', [1, 1]);
        });
        it('should return false if permission not found for removal', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0 });
            const removed = await roleService.removePermissionFromRole(999, 999);
            expect(removed).toBe(false);
        });
    });
});
