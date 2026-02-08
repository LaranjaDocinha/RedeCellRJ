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

describe('Z-Reports API', () => {
  let adminToken: string;
  let testBranchId: number;
  let userId: string;

  beforeAll(async () => {
    const pool = getPool();

    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.data.accessToken;

    const userRes = await getAdminUserId(pool);
    userId = userRes.id;
    testBranchId = await seedBranch(pool);
    const customerId = await seedCustomer(pool);

    const product1 = await seedProduct(testBranchId, pool);

    const today = new Date();
    today.setHours(10, 0, 0, 0);
    await seedSale({
      client: pool,
      userId: userId,
      customerId: customerId,
      branchId: testBranchId,
      saleDate: today,
      totalAmount: 300,
      items: [
        {
          productId: product1.productId,
          variationId: product1.variationId,
          quantity: 3,
          unitPrice: 100,
          costPrice: 50,
        },
      ],
      payments: [{ method: 'cash', amount: 300 }],
    });
  });

  describe('GET /api/reports/z-report', () => {
    it('should successfully retrieve the Z-Report for today', async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const res = await request(app)
        .get(
          `/api/reports/z-report?startDate=${todayStart.toISOString()}&endDate=${todayEnd.toISOString()}`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Number(res.body.data.totalSalesAmount)).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/reports/z-report');
      expect(res.statusCode).toEqual(401);
    });
  });
});
