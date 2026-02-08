import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db/index.js';
import {
  seedSale,
  getAdminUserId,
  seedBranch,
  seedCustomer,
  seedProduct,
  seedCategory,
} from '../utils/seedTestData.js';
import { getAdminAuthToken } from '../utils/auth.js';

describe('Reports Integration Tests', () => {
  let adminToken: string;

  beforeEach(async () => {
    adminToken = await getAdminAuthToken();
    const pool = getPool();
    const userRes = await getAdminUserId(pool);
    const branchId = await seedBranch(pool);
    const customerId = await seedCustomer(pool);
    const product = await seedProduct(branchId, pool);

    await seedSale({
      client: pool,
      userId: userRes.id,
      customerId: customerId,
      branchId: branchId,
      totalAmount: 100,
      items: [
        {
          productId: product.productId,
          variationId: product.variationId,
          quantity: 1,
          unitPrice: 100,
          costPrice: 50,
        },
      ],
      payments: [{ method: 'cash', amount: 100 }],
    });
  });

  it('should get contribution margin by category report', async () => {
    const pool = getPool();
    const branchId = await seedBranch(pool);
    const categoryId = await seedCategory(pool);
    const { productId, variationId } = await seedProduct(branchId, pool, categoryId);
    const customerId = await seedCustomer(pool);
    const adminId = await getAdminUserId(pool);

    await seedSale({
      client: pool,
      userId: adminId!,
      customerId: String(customerId),
      saleDate: new Date(),
      totalAmount: 100,
      items: [
        {
          productId,
          variationId,
          quantity: 1,
          unitPrice: 100,
          costPrice: 50,
        },
      ],
      payments: [{ method: 'cash', amount: 100 }],
    });

    const res = await request(app)
      .get('/api/reports/contribution-margin-by-category')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array); // Expecting data field which contains the array
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('category_name');
    expect(Number(res.body.data[0].contribution_margin)).toBeGreaterThan(0);
  });

  it('should return 401 if no authentication token is provided', async () => {
    const res = await request(app).get('/api/reports/contribution-margin-by-category');
    expect(res.statusCode).toBe(401);
  });
});
