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

describe('COGS Report API', () => {
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
    console.log('[cogs.integration.test.ts] branchId:', branchId);
    const product = await seedProduct(branchId, client);
    productId = product.productId;
    variationId = product.variationId;
    customerId = await seedCustomer(client);
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
    client.release();
  });

  it('should return a COGS report', async () => {
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
    console.log('Sending sale data:', saleData);
    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send(saleData);
    console.log('Sale creation response status:', saleRes.status);
    console.log('Sale creation response body:', saleRes.body);

    const startDate = '2020-01-01';
    const endDate = '2030-01-01';
    console.log('COGS report request dates:', { startDate, endDate });

    const res = await request(app)
      .get(`/api/cogs?startDate=${startDate}&endDate=${endDate}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('total_cogs');
    expect(parseFloat(res.body.total_cogs)).toBeGreaterThan(0);
  });
});
