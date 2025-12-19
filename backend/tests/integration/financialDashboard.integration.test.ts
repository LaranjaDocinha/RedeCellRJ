import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db';
import {
  seedBranch,
  seedCustomer,
  getAdminUserId,
  seedProduct,
} from '../utils/seedTestData';
import { saleService } from '../../src/services/saleService.js';

describe('Financial Dashboard API', () => {
  let authToken: string;
  let branchId: number;
  let productId: number;
  let variationId: number;
  let customerId: string;
  let userId: string;
  let client: any;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    authToken = loginRes.body.token;
    userId = (await getAdminUserId()).id;
  });

  beforeEach(async () => {
    client = await getPool().connect();
    await client.query('BEGIN');

    branchId = await seedBranch(client);
    console.log('[financialDashboard.integration.test.ts] branchId:', branchId);
    const product = await seedProduct(branchId, client);
    productId = product.productId;
    variationId = product.variationId;
    customerId = await seedCustomer(client);
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
    client.release();
  });

  it('should return financial dashboard data', async () => {
    const saleData = {
      branchId: branchId,
      customerId: customerId,
      total_amount: 200,
      payment_type: 'cash',
      payments: [{ method: 'cash', amount: 200 }],
      items: [
        {
          product_id: productId,
          variation_id: variationId,
          quantity: 2,
          unit_price: 100,
        },
      ],
    };

    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send(saleData);

    const res = await request(app)
      .get('/api/financial-dashboard?startDate=2020-01-01&endDate=2030-01-01')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('total_revenue');
    expect(res.body.total_revenue).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('total_cogs');
    expect(res.body.total_cogs).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('total_profit');
    expect(res.body).toHaveProperty('sales_by_category');
    expect(res.body.sales_by_category.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('top_selling_products');
    expect(res.body.top_selling_products.length).toBeGreaterThan(0);
  });
});
