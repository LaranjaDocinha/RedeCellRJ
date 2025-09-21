
import request from 'supertest';
import app from '../../src/index';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Pool } from 'pg';
import { setupIntegrationTestDatabase, teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';
import { authService } from '../../src/services/authService';

import { getTestPool } from '../testPool';

describe('Inventory API', () => {
  let authToken: string;
  let adminToken: string;
  let testUserId: number;
  let testAdminId: number;
  let testProductId: number;
  let testVariationId: number;

  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['users', 'products', 'product_variations', 'branches']);

    // Create a test user and admin
    const userRes = await authService.register('testuser@inventory.com', 'password123', 'user');
    authToken = userRes.token;
    testUserId = userRes.user.id;

    const adminRes = await authService.register('testadmin@inventory.com', 'adminpassword', 'admin');
    adminToken = adminRes.token;
    testAdminId = adminRes.user.id;

    // Seed a product and variation for testing inventory
    await getTestPool().query(
      "INSERT INTO branches (id, name) VALUES (1, 'Main Branch') ON CONFLICT (id) DO NOTHING;"
    );
    await getTestPool().query(
      "INSERT INTO products (id, name, sku, product_type, branch_id) VALUES (100, 'Inventory Test Product', 'INV-TEST-001', 'physical', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;"
    );
    await getTestPool().query(
      "INSERT INTO product_variations (id, product_id, color, price, stock_quantity) VALUES (100, 100, 'Red', 10.00, 5) ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;"
    );
    testProductId = 100;
    testVariationId = 100;
  });

  it('should get low stock products', async () => {
    const res = await request(app)
      .get('/api/inventory/low-stock?threshold=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.some((p: any) => p.variation_id === testVariationId)).toBe(true);
  });

  it('should adjust stock quantity', async () => {
    const res = await request(app)
      .put('/api/inventory/adjust-stock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variationId: testVariationId, quantityChange: 5 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.stock_quantity).toEqual(10); // 5 (initial) + 5 (change)
  });

  it('should receive stock', async () => {
    const res = await request(app)
      .put('/api/inventory/receive-stock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variationId: testVariationId, quantity: 10 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.stock_quantity).toEqual(20); // 10 (after adjust) + 10 (receive)
  });

  it('should dispatch stock', async () => {
    const res = await request(app)
      .put('/api/inventory/dispatch-stock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variationId: testVariationId, quantity: 5 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.stock_quantity).toEqual(15); // 20 (after receive) - 5 (dispatch)
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 if not authorized', async () => {
    const res = await request(app)
      .get('/api/inventory/low-stock')
      .set('Authorization', `Bearer ${authToken}`); // User token
    expect(res.statusCode).toEqual(403);
  });
});
