import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db';
import {
  seedCustomer,
  getAdminUserId,
  seedProduct,
  seedBranch,
  seedSale,
} from '../utils/seedTestData';

describe('CLV Report API', () => {
  let context: { authToken: string; userId: string };
  let customerId: string;
  let branchId: number;
  let productId: number;
  let variationId: number;
  let noSalesCustomerId: string;
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    const authToken = loginRes.body.accessToken;
    const adminUserId = await getAdminUserId();
    console.log('[clv.integration.test.ts] adminUserResult from getAdminUserId:', adminUserId);
    console.log(
      '[clv.integration.test.ts] userId after getAdminUserId (inside beforeAll):',
      adminUserId,
    );

    context = { authToken, userId: adminUserId };
  });

  beforeEach(async () => {
    const pool = getPool();
    customerId = await seedCustomer(pool);
    branchId = await seedBranch(pool);
    const product = await seedProduct(branchId, pool);
    productId = product.productId;
    variationId = product.variationId;
    noSalesCustomerId = await seedCustomer(pool);
  });

  afterEach(async () => {
    // Cleanup handled by setupTestCleanup if implemented, otherwise manually cleanup if needed
  });

  it('should return a CLV report for a customer with sales', async () => {
    const pool = getPool();
    await seedSale({
      client: pool,
      userId: context.userId,
      customerId: customerId,
      branchId: branchId,
      totalAmount: 200,
      payments: [{ method: 'cash', amount: 200 }],
      items: [{ productId, variationId, quantity: 2, unitPrice: 100, costPrice: 50 }],
    });
    await seedSale({
      client: pool,
      userId: context.userId,
      customerId: customerId,
      branchId: branchId,
      totalAmount: 200,
      payments: [{ method: 'cash', amount: 200 }],
      items: [{ productId, variationId, quantity: 2, unitPrice: 100, costPrice: 50 }],
    });
    await seedSale({
      client: pool,
      userId: context.userId,
      customerId: customerId,
      branchId: branchId,
      totalAmount: 200,
      payments: [{ method: 'cash', amount: 200 }],
      items: [{ productId, variationId, quantity: 2, unitPrice: 100, costPrice: 50 }],
    });

    const res = await request(app)
      .get(`/api/reports/clv/customers/${customerId}`)
      .set('Authorization', `Bearer ${context.authToken}`)
      .expect(200);

    expect(res.body.data).toHaveProperty('customer_id', customerId);
    expect(res.body.data).toHaveProperty('total_revenue');
    expect(Number(res.body.data.total_revenue)).toBeGreaterThan(0);
    expect(res.body.data).toHaveProperty('num_purchases', 3);
    expect(res.body.data).toHaveProperty('apv');
    expect(res.body.data.apv).toBeCloseTo(200);
    expect(res.body.data).toHaveProperty('apf');
    expect(res.body.data.apf).toBeGreaterThan(0);
    expect(res.body.data).toHaveProperty('clv');
    expect(res.body.data.clv).toBeGreaterThan(0);
  });

  it('should return CLV of 0 for a customer with no sales', async () => {
    const res = await request(app)
      .get(`/api/reports/clv/customers/${noSalesCustomerId}`)
      .set('Authorization', `Bearer ${context.authToken}`)
      .expect(200);

    expect(res.body.data).toHaveProperty('customer_id', noSalesCustomerId);
    expect(res.body.data).toHaveProperty('clv', 0);
    expect(res.body.data).toHaveProperty('message', 'No purchase data for this customer.');
  });
});
