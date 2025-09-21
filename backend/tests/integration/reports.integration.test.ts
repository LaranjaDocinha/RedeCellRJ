import request from 'supertest';
import app from '../../src/index';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getTestPool } from '../testPool';

import { teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';
import { authService } from '../../src/services/authService';

// Mock the db module
vi.mock('../../src/db/index.js', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_, prop) => Reflect.get(getTestPool(), prop),
  }),
}));

describe('Reports API', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: number;
  let userId: number;
  let productId: number;
  let variationId: number;
  let saleId: number;

  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['users', 'products', 'product_variations', 'sales', 'sale_items', 'branches']);

    // Create test users
    const adminUser = await authService.register('admin@reports.com', 'password123', 'admin');
    adminToken = adminUser.token;
    adminId = adminUser.user.id;

    const regularUser = await authService.register('user@reports.com', 'password123', 'user');
    userToken = regularUser.token;
    userId = regularUser.user.id;

    // Seed product and variation
    await getTestPool().query("INSERT INTO branches (id, name) VALUES (1, 'Main Branch') ON CONFLICT (id) DO NOTHING;");
    await getTestPool().query("INSERT INTO products (id, name, sku, product_type, branch_id) VALUES (200, 'Report Product', 'RP-001', 'physical', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;");
    await getTestPool().query("INSERT INTO product_variations (id, product_id, color, price, stock_quantity) VALUES (200, 200, 'Blue', 25.00, 100) ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;");
    productId = 200;
    variationId = 200;

    // Seed sales data
    const saleDate1 = new Date();
    saleDate1.setDate(saleDate1.getDate() - 5); // 5 days ago
    const saleDate2 = new Date();
    saleDate2.setDate(saleDate2.getDate() - 2); // 2 days ago

    const sale1 = await getTestPool().query(
      'INSERT INTO sales (user_id, total_amount, sale_date) VALUES ($1, $2, $3) RETURNING id',
      [adminId, 50.00, saleDate1]
    );
    saleId = sale1.rows[0].id;

    await getTestPool().query(
      'INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4, $5)',
      [saleId, productId, variationId, 2, 25.00]
    );

    await getTestPool().query(
      'INSERT INTO sales (user_id, total_amount, sale_date) VALUES ($1, $2, $3) RETURNING id',
      [userId, 75.00, saleDate2]
    );
  });

  it('should get sales by date report', async () => {
    const res = await request(app)
      .get('/api/reports/sales-by-date')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('sale_date');
    expect(res.body[0]).toHaveProperty('daily_sales');
  });

  it('should get sales by product report', async () => {
    const res = await request(app)
      .get('/api/reports/sales-by-product')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('product_name');
    expect(res.body[0]).toHaveProperty('total_revenue');
  });

  it('should get sales by customer report', async () => {
    const res = await request(app)
      .get('/api/reports/sales-by-customer')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('customer_name');
    expect(res.body[0]).toHaveProperty('total_spent');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/reports/sales-by-date');
    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 if not authorized', async () => {
    const res = await request(app)
      .get('/api/reports/sales-by-date')
      .set('Authorization', `Bearer ${userToken}`); // Regular user token
    expect(res.statusCode).toEqual(403);
  });
});
