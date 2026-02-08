import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { seedBranch, seedProduct, seedStock, seedCustomer } from '../utils/seedTestData.js';
import { getPool } from '../../src/db/index.js';
import { getAdminAuthToken } from '../utils/auth.js';

describe('Sale Service API - Integration', () => {
  let adminToken: string;
  let testBranchId: number;
  let testProductId: number;
  let testVariantId: number;
  let testCustomerId: number;

  beforeAll(async () => {
    adminToken = await getAdminAuthToken();
  });

  beforeEach(async () => {
    const pool = getPool();
    testBranchId = await seedBranch(pool);
    const { productId, variationId } = await seedProduct(testBranchId, pool);
    testProductId = productId;
    testVariantId = variationId;
    await seedStock(pool, testVariantId.toString(), testBranchId.toString(), 10);
    testCustomerId = await seedCustomer(pool);
  });

  it('should create a sale and correctly update stock', async () => {
    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
      payment_type: 'cash',
      payments: [
        {
          method: 'cash',
          amount: 100,
        },
      ],
      items: [
        {
          product_id: testProductId,
          variation_id: testVariantId,
          quantity: 2,
          unit_price: 50,
          total_price: 100,
        },
      ],
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    console.log('DEBUG TEST RES BODY:', JSON.stringify(res.body));
    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('sale_id');

    const stockCheck = await getPool().query(
      `SELECT stock_quantity FROM branch_product_variations_stock WHERE product_variation_id = $1 AND branch_id = $2`,
      [testVariantId, testBranchId],
    );
    expect(Number(stockCheck.rows[0].stock_quantity)).toBe(8);
  });

  it('should create a sale with split payments (cash + credit card)', async () => {
    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
      payment_type: 'mixed',
      payments: [
        { method: 'cash', amount: 40 },
        { method: 'credit_card', amount: 60, transaction_id: 'cc_trans_123' },
      ],
      items: [
        {
          product_id: testProductId,
          variation_id: testVariantId,
          quantity: 1,
          unit_price: 100,
          total_price: 100,
        },
      ],
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    console.log('DEBUG TEST RES BODY:', JSON.stringify(res.body));
    expect(res.statusCode).toEqual(201);

    const paymentsCheck = await getPool().query(
      `SELECT payment_method, amount FROM sale_payments WHERE sale_id = $1 ORDER BY payment_method`,
      [res.body.data.sale_id],
    );
    expect(paymentsCheck.rows).toHaveLength(2);
    expect(paymentsCheck.rows.find((p) => p.payment_method === 'cash').amount).toMatch(/40/);
    expect(paymentsCheck.rows.find((p) => p.payment_method === 'credit_card').amount).toMatch(/60/);
  });

  it('should create a sale with split payments (cash + store credit)', async () => {
    const pool = getPool();
    // Use the route to add credit to ensure consistency
    await request(app)
      .post(`/api/customers/${testCustomerId}/credit/add`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 50, reason: 'Initial seed' });

    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
      payment_type: 'mixed',
      payments: [
        { method: 'cash', amount: 50 },
        { method: 'store_credit', amount: 50 },
      ],
      items: [
        {
          product_id: testProductId,
          variation_id: testVariantId,
          quantity: 1,
          unit_price: 100,
          total_price: 100,
        },
      ],
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    console.log('DEBUG TEST RES BODY:', JSON.stringify(res.body));
    expect(res.statusCode).toEqual(201);

    const customerCheck = await pool.query(
      `SELECT store_credit_balance FROM customers WHERE id = $1`,
      [testCustomerId],
    );
    // 50 initial + 1 cashback (1% of 100) - 50 used = 1
    expect(Number(customerCheck.rows[0].store_credit_balance)).toBe(1);
  });

  it('should return 400 for insufficient store credit in split payment', async () => {
    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
      payment_type: 'mixed',
      payments: [
        { method: 'cash', amount: 50 },
        { method: 'store_credit', amount: 50 },
      ],
      items: [
        {
          product_id: testProductId,
          variation_id: testVariantId,
          quantity: 1,
          unit_price: 100,
          total_price: 100,
        },
      ],
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.data.message).toMatch(/insuficiente|insufficient/i);
  });
});
