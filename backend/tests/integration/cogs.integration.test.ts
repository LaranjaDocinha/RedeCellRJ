import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db';
import {
  seedBranch,
  seedCustomer,
  getAdminUserId,
  seedProduct,
  seedSale,
} from '../utils/seedTestData';

describe('COGS Report API', () => {
  let authToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    authToken = loginRes.body.accessToken;
    const adminUser = await getAdminUserId();
    adminUserId = adminUser.id;
  });

  it('should return a COGS report', async () => {
    const pool = getPool();
    const branchId = await seedBranch(pool);
    const customerId = await seedCustomer(pool);
    const { productId, variationId } = await seedProduct(branchId, pool);

    await seedSale({
      client: pool,
      userId: adminUserId,
      customerId,
      totalAmount: 200,
      items: [
        {
          productId,
          variationId,
          quantity: 2,
          unitPrice: 100,
          costPrice: 50,
        },
      ],
      payments: [{ method: 'cash', amount: 200 }],
    });

    const startDate = '2020-01-01';
    const endDate = '2030-01-01';

    const res = await request(app)
      .get(`/api/reports/cogs?startDate=${startDate}&endDate=${endDate}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data).toHaveProperty('total_cogs');
    expect(parseFloat(res.body.data.total_cogs)).toBeGreaterThan(0);
  });
});
