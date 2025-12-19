import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db';
import {
  seedCustomer,
  getAdminUserId,
  seedProduct,
  seedBranch,
} from '../utils/seedTestData';
import { saleService } from '../../src/services/saleService.js';

describe('CLV Report API', () => {
  let context: { authToken: string; userId: string };
  let customerId: string;
  let branchId: number;
  let productId: number;
  let variationId: number;
  let noSalesCustomerId: string;
  let client: any;
  let saleData: any;
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    const authToken = loginRes.body.token;
    const adminUserResult = await getAdminUserId();
    console.log('[clv.integration.test.ts] adminUserResult from getAdminUserId:', adminUserResult);
    const adminUserId = adminUserResult ? adminUserResult.id : undefined;
    console.log(
      '[clv.integration.test.ts] userId after getAdminUserId (inside beforeAll):',
      adminUserId,
    );

    context = { authToken, userId: adminUserId };
  });

  beforeEach(async () => {
    client = await getPool().connect();
    await client.query('BEGIN');

    customerId = await seedCustomer(client);
    branchId = await seedBranch(client);
    console.log('[clv.integration.test.ts] branchId:', branchId);
    const product = await seedProduct(branchId, client);
    productId = product.productId;
    variationId = product.variationId;
    noSalesCustomerId = await seedCustomer(client);
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
    client.release();
  });

  it('should return a CLV report for a customer with sales', async () => {
    const saleData = {
      userId: context.userId,
      customerId: customerId,
      branchId: branchId,
      total_amount: 200,
      payments: [{ method: 'cash', amount: 200 }],
      items: [
        {
          product_id: productId,
          variation_id: variationId,
          quantity: 2,
          unit_price: 100,
          cost_price: 50,
        },
      ],
    };

    console.log('[clv.integration.test.ts] customerId before sales:', customerId);
    console.log(
      '[clv.integration.test.ts] saleData before sales:',
      JSON.stringify(saleData, null, 2),
    );
    console.log('[clv.integration.test.ts] userId before createSale:', context.userId);

    await saleService.createSale({
      userId: context.userId,
      customerId: saleData.customerId,
      branchId: saleData.branchId,
      total_amount: saleData.total_amount,
      payments: saleData.payments,
      items: saleData.items,
      client: client,
    });
    await saleService.createSale({
      userId: context.userId,
      customerId: saleData.customerId,
      branchId: saleData.branchId,
      total_amount: saleData.total_amount,
      payments: saleData.payments,
      items: saleData.items,
      client: client,
    });
    await saleService.createSale({
      userId: context.userId,
      customerId: saleData.customerId,
      branchId: saleData.branchId,
      total_amount: saleData.total_amount,
      payments: saleData.payments,
      items: saleData.items,
      client: client,
    });

    const res = await request(app)
      .get(`/api/customers/${customerId}/clv`)
      .set('Authorization', `Bearer ${context.authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('customer_id', customerId);
    expect(res.body).toHaveProperty('total_revenue');
    expect(res.body.total_revenue).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('num_purchases', 3);
    expect(res.body).toHaveProperty('apv');
    expect(res.body.apv).toBeCloseTo(200);
    expect(res.body).toHaveProperty('apf');
    expect(res.body.apf).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('clv');
    expect(res.body.clv).toBeGreaterThan(0);
  });

  it('should return CLV of 0 for a customer with no sales', async () => {
    const res = await request(app)
      .get(`/api/customers/${noSalesCustomerId}/clv`)
      .set('Authorization', `Bearer ${context.authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('customer_id', noSalesCustomerId);
    expect(res.body).toHaveProperty('clv', 0);
    expect(res.body).toHaveProperty('message', 'No purchase data for this customer.');
  });
});
