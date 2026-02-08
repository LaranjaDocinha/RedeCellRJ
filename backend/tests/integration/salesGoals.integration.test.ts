import request from 'supertest';
import { app } from '../../src/app';
import { getPool } from '../../src/db/index';
import {
  seedSale,
  getAdminUserId,
  seedBranch,
  seedCustomer,
  seedProduct,
} from '../utils/seedTestData';
import { describe, it, expect, beforeAll } from 'vitest';

describe('Sales Goals API', () => {
  let adminToken: string;
  let testBranchId: number;
  let userId: string;

  beforeAll(async () => {
    const pool = getPool();
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.accessToken;

    const userRes = await getAdminUserId(pool);
    userId = userRes.id;
    testBranchId = await seedBranch(pool);
    const customerId = await seedCustomer(pool);
    const product1 = await seedProduct(testBranchId, pool);

    await seedSale({
      client: pool,
      userId: userId!,
      customerId: String(customerId),
      saleDate: new Date(),
      totalAmount: 600,
      items: [
        {
          productId: product1.productId,
          variationId: product1.variationId,
          quantity: 6,
          unitPrice: 100,
          costPrice: 50,
        },
      ],
      payments: [{ method: 'cash', amount: 600 }],
    });
  });

  describe('GET /api/sales-goals/current-daily', () => {
    it('should successfully retrieve the current daily sales goal', async () => {
      const res = await request(app)
        .get('/api/sales-goals/current-daily')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Number(res.body.currentSalesAmount)).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/sales-goals/current-daily');
      expect(res.statusCode).toEqual(401);
    });
  });
});
