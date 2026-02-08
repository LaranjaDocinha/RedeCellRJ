import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { getPool } from '../../src/db/index';
import {
  seedUser,
  seedRole,
  assignRoleToUser,
  seedPermission,
  assignPermissionToRole,
  cleanupUser,
  cleanupRole,
  cleanupPermission,
} from '../utils/seedTestData';

// Helper para criar permissões de teste
const createTestPermission = async (action: string, subject: string) => {
  const pool = getPool();
  const res = await pool.query(
    'INSERT INTO permissions (action, subject) VALUES ($1, $2) RETURNING id',
    [action, subject],
  );
  return res.rows[0].id;
};

describe('Roles API Integration', () => {
  let adminToken: string;
  let pool: any;
  let adminUserId: string;
  let adminRoleId: number;
  let manageRolesId: number;
  let permissionId1: number;
  let permissionId2: number;

  beforeAll(async () => {
    pool = getPool();

    // Create unique admin for this test suite
    const timestamp = Date.now();
    const adminUserData = {
      name: `Admin Roles ${timestamp}`,
      email: `admin.roles.${timestamp}@test.com`,
      password: 'password123',
    };

    adminUserId = await seedUser(pool, adminUserData);
    adminRoleId = await seedRole(pool, `AdminRolesRole-${timestamp}`);
    manageRolesId = await seedPermission(pool, 'manage', 'Roles');

    await assignRoleToUser(pool, adminUserId, adminRoleId);
    await assignPermissionToRole(pool, adminRoleId, manageRolesId);

    // Login to get real token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUserData.email, password: adminUserData.password });

    adminToken = res.body.data.accessToken;

    // Permissions for testing roles
    permissionId1 = await createTestPermission('view', `Dashboard-${timestamp}`);
    permissionId2 = await createTestPermission('manage', `Products-${timestamp}`);
  });

  afterAll(async () => {
    // Cleanup specific resources
    if (adminUserId) {
      await pool.query('DELETE FROM user_roles WHERE user_id = $1', [adminUserId]);
      await cleanupUser(pool, adminUserId);
    }
    if (adminRoleId) {
      await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [adminRoleId]);
      await cleanupRole(pool, adminRoleId);
    }
    if (manageRolesId) await cleanupPermission(pool, manageRolesId);
    if (permissionId1) await cleanupPermission(pool, permissionId1);
    if (permissionId2) await cleanupPermission(pool, permissionId2);

    // Clean up roles created in tests
    await pool.query(
      "DELETE FROM roles WHERE name IN ('Test Role', 'Viewer', 'Editable Role', 'Edited Role', 'Deletable Role')",
    );
  });

  it('should create a new role with permissions via POST /api/roles', async () => {
    const newRole = {
      name: 'Test Role',
      permissionIds: [permissionId1, permissionId2],
    };

    const response = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newRole);

    expect([201, 200]).toContain(response.status);
    const body = response.body.data || response.body;
    expect(body.message || response.body.message).toMatch(/success/i);
    const roleId = body.roleId || body.id;
    expect(roleId).toBeDefined();

    // Verificar se o role foi realmente criado no DB
    const dbRole = await pool.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    expect(dbRole.rows[0].name).toBe('Test Role');

    // Verificar se as permissões foram associadas
    const dbPermissions = await pool.query(
      'SELECT permission_id FROM role_permissions WHERE role_id = $1',
      [roleId],
    );
    expect(dbPermissions.rows.map((row: any) => row.permission_id)).toEqual(
      expect.arrayContaining([permissionId1, permissionId2]),
    );
  });

  it('should get all roles with permissions via GET /api/roles', async () => {
    // Criar um role antes de buscar
    const roleId = (
      await pool.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', ['Viewer'])
    ).rows[0].id;
    await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [
      roleId,
      permissionId1,
    ]);

    const response = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    const viewerRole = response.body.data.find((r: any) => r.name === 'Viewer');
    expect(viewerRole).toBeDefined();
    expect(viewerRole.permissions).toBeInstanceOf(Array);
    expect(viewerRole.permissions.some((p: any) => p.id === permissionId1)).toBe(true);
  });

  it('should update a role and its permissions via PUT /api/roles/:id', async () => {
    const roleId = (
      await pool.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', ['Editable Role'])
    ).rows[0].id;
    await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [
      roleId,
      permissionId1,
    ]);

    const updatedName = 'Edited Role';
    const updatedPermissions = [permissionId2]; // Mudar permissões

    const response = await request(app)
      .put(`/api/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: updatedName, permissionIds: updatedPermissions });

    expect(response.status).toBe(200);
    const body = response.body.data || response.body;
    expect(body.message || response.body.message).toMatch(/success/i);

    // Verificar no DB
    const dbRole = await pool.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    expect(dbRole.rows[0].name).toBe(updatedName);

    const dbPermissions = await pool.query(
      'SELECT permission_id FROM role_permissions WHERE role_id = $1',
      [roleId],
    );
    expect(dbPermissions.rows.map((row: any) => row.permission_id)).toEqual(
      expect.arrayContaining(updatedPermissions),
    );
    expect(dbPermissions.rows.map((row: any) => row.permission_id)).not.toEqual(
      expect.arrayContaining([permissionId1]),
    ); // Permissão antiga removida
  });

  it('should delete a role via DELETE /api/roles/:id', async () => {
    const roleId = (
      await pool.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', ['Deletable Role'])
    ).rows[0].id;

    const res = await request(app)
      .delete(`/api/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 204]).toContain(res.status);

    const dbRole = await pool.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    expect(dbRole.rows).toHaveLength(0);
  });
});
