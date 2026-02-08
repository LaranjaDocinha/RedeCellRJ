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
import { describe, it, expect, beforeEach } from 'vitest';
import { getAdminAuthToken } from '../utils/auth.js';

describe('Financial Dashboard API', () => {
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
      totalAmount: 500,
      items: [
        {
          productId: product.productId,
          variationId: product.variationId,
          quantity: 5,
          unitPrice: 100,
          costPrice: 50,
        },
      ],
      payments: [{ method: 'cash', amount: 500 }],
    });
  });

  it('should return financial dashboard data', async () => {
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
      .get('/api/reports/financial-dashboard?startDate=2020-01-01&endDate=2030-01-01')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Number(res.body.data.total_revenue)).toBeGreaterThan(0);
    expect(Number(res.body.data.total_profit)).toBeGreaterThan(0);
  });
});
