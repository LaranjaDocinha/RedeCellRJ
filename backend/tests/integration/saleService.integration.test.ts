import request from 'supertest';
import { app, httpServer } from '../../src/app.js';
import { 
  seedBranch, 
  seedProduct, 
  seedStock,
  cleanupBranch,
  cleanupProduct,
  seedCustomer,
  cleanupCustomer
} from '../utils/seedTestData.js';
import { getPool } from '../../src/db/index.js';

describe('Sale Service API - Integration', () => {
  let adminToken: string;
  let testBranchId: number;
  let testProductId: number;
  let testVariantId: number;
  let testCustomerId: number;

  beforeAll(async () => {
    const res = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = res.body.token;
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

  afterEach(async () => {
    const pool = getPool();
    await cleanupProduct(testProductId.toString(), pool);
    await cleanupBranch(testBranchId.toString(), pool);
    await cleanupCustomer(testCustomerId.toString(), pool);
  });

  afterAll(async () => {
    await httpServer.close();
  });

  it('should create a sale and correctly update stock', async () => {
    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
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

    const res = await request(httpServer)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('sale_id');
    expect(res.body.total_amount).toBe(100); // Check if backend returns string or number

    const stockCheck = await getPool().query(
      `SELECT stock_quantity FROM branch_product_variations_stock WHERE product_variation_id = $1 AND branch_id = $2`,
      [testVariantId, testBranchId]
    );
    expect(stockCheck.rows[0].stock_quantity).toBe(8); // 10 - 2
  });

  it('should create a sale with split payments (cash + credit card)', async () => {
    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
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

    const res = await request(httpServer)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('sale_id');

    const paymentsCheck = await getPool().query(
      `SELECT payment_method, amount FROM sale_payments WHERE sale_id = $1 ORDER BY payment_method`,
      [res.body.sale_id]
    );
    expect(paymentsCheck.rows).toHaveLength(2);
    expect(paymentsCheck.rows[0].payment_method).toEqual('cash');
    expect(paymentsCheck.rows[0].amount).toEqual('40.00');
    expect(paymentsCheck.rows[1].payment_method).toEqual('credit_card');
    expect(paymentsCheck.rows[1].amount).toEqual('60.00');
  });

  it('should create a sale with split payments (cash + store credit)', async () => {
    const pool = getPool();
    await pool.query(
      `UPDATE customers SET store_credit_balance = 50.00 WHERE id = $1`,
      [testCustomerId]
    );

    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
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

    const res = await request(httpServer)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    expect(res.statusCode).toEqual(201);

    const customerCheck = await pool.query(
      `SELECT store_credit_balance FROM customers WHERE id = $1`,
      [testCustomerId]
    );
    expect(customerCheck.rows[0].store_credit_balance).toEqual('0.00');

    const transactionCheck = await pool.query(
      `SELECT amount, type, notes FROM store_credit_transactions WHERE customer_id = $1 AND related_id = $2`,
      [testCustomerId, res.body.sale_id]
    );
    expect(transactionCheck.rows).toHaveLength(1);
    expect(transactionCheck.rows[0].amount).toEqual('50.00');
  });

  it('should return 400 if sum of payments does not match total sale amount', async () => {
    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
      payments: [
        { method: 'cash', amount: 40 },
        { method: 'credit_card', amount: 50 },
      ],
      items: [
        {
          product_id: testProductId,
          variation_id: testVariantId,
          quantity: 1,
          unit_price: 100,
          total_price: 100
        },
      ],
    };

    const res = await request(httpServer)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Sum of payments does not match total sale amount');
  });

  it('should return 400 for insufficient store credit in split payment', async () => {
    const pool = getPool();
    await pool.query(
      `UPDATE customers SET store_credit_balance = 20.00 WHERE id = $1`,
      [testCustomerId]
    );

    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
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
          total_price: 100
        },
      ],
    };

    const res = await request(httpServer)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Insufficient store credit');
  });
});
