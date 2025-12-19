import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app'; // Sua aplicação Express
import { getPool } from '../../src/db/index'; // Para limpar o DB de teste
import { seedUser, seedRole, assignRoleToUser, seedPermission, assignPermissionToRole, cleanupUser, cleanupRole, cleanupPermission } from '../utils/seedTestData';

describe('Permissions API Integration', () => {
  let adminToken: string;
  let pool: any;
  let adminUserId: string;
  let adminRoleId: number;
  let managePermissionsId: number;
  
  // Track IDs for cleanup
  const permissionsToCleanup: number[] = [];

  beforeAll(async () => {
    pool = getPool();
    
    // Create a unique admin user for this test
    const timestamp = Date.now();
    const adminUserData = {
      name: `Admin Perms ${timestamp}`,
      email: `admin.perms.${timestamp}@test.com`,
      password: 'password123'
    };
    
    adminUserId = await seedUser(pool, adminUserData);
    adminRoleId = await seedRole(pool, `AdminPermsRole-${timestamp}`);
    managePermissionsId = await seedPermission(pool, 'manage', 'Permissions'); // Assuming this permission implies access
    
    await assignRoleToUser(pool, adminUserId, adminRoleId);
    await assignPermissionToRole(pool, adminRoleId, managePermissionsId);

    // Login to get real token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUserData.email, password: adminUserData.password });
      
    adminToken = res.body.token;
  });

  afterEach(async () => {
      // Cleanup permissions created in individual tests
      if (permissionsToCleanup.length > 0) {
          await pool.query('DELETE FROM permissions WHERE id = ANY($1)', [permissionsToCleanup]);
          permissionsToCleanup.length = 0; // Reset array
      }
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
    if (managePermissionsId) await cleanupPermission(pool, managePermissionsId);
  });

  it('should create a new permission via POST /api/permissions', async () => {
    const newPermission = {
      action: 'create',
      subject: `Users-${Date.now()}`, // Unique subject
    };

    const response = await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newPermission)
      .expect(201);

    expect(response.body.action).toBe('create');
    expect(response.body.subject).toBe(newPermission.subject);
    expect(response.body.id).toBeDefined();
    permissionsToCleanup.push(response.body.id);
  });

  it('should get all permissions via GET /api/permissions', async () => {
    // Criar uma permissão antes de buscar
    const sub = `Reports-${Date.now()}`;
    const id = await seedPermission(pool, 'view', sub);
    permissionsToCleanup.push(id);

    const response = await request(app)
      .get('/api/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.some((p: any) => p.action === 'view' && p.subject === sub)).toBe(
      true,
    );
  });

  it('should get a permission by ID via GET /api/permissions/:id', async () => {
    const sub = `Settings-${Date.now()}`;
    const permissionId = await seedPermission(pool, 'edit', sub);
    permissionsToCleanup.push(permissionId);

    const response = await request(app)
      .get(`/api/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.action).toBe('edit');
    expect(response.body.subject).toBe(sub);
  });

  it('should update a permission via PUT /api/permissions/:id', async () => {
    const sub = `OldSub-${Date.now()}`;
    const permissionId = await seedPermission(pool, 'old_action', sub);
    permissionsToCleanup.push(permissionId);

    const updatedPermission = {
      action: 'new_action',
      subject: `NewSub-${Date.now()}`,
    };

    const response = await request(app)
      .put(`/api/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedPermission)
      .expect(200);

    expect(response.body.action).toBe('new_action');
    expect(response.body.subject).toBe(updatedPermission.subject);
  });

  it('should delete a permission via DELETE /api/permissions/:id', async () => {
    const sub = `Logs-${Date.now()}`;
    const permissionId = await seedPermission(pool, 'delete', sub);
    // Don't add to permissionsToCleanup because we delete it in test

    await request(app)
      .delete(`/api/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const dbPermission = await pool.query('SELECT * FROM permissions WHERE id = $1', [
      permissionId,
    ]);
    expect(dbPermission.rows).toHaveLength(0);
  });
});
