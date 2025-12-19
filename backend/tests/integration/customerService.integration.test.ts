import request from 'supertest';
import { app, httpServer } from '../../src/app.js';
import { getPool } from '../../src/db/index.js';
import {
  seedCustomer,
  cleanupCustomer,
  seedBranch,
  cleanupBranch,
  seedCategory,
  cleanupCategory,
  seedProduct,
  cleanupProduct,
  seedSale,
  cleanupSale,
} from '../utils/seedTestData.js';

describe('Customer API - Integration', () => {
  let adminToken: string;
  const customersToCleanup: string[] = [];
  const salesToCleanup: string[] = [];

  beforeAll(async () => {
    const res = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = res.body.token;
  });

  afterAll(async () => {
    const pool = getPool();
    for (const customerId of customersToCleanup) {
      await cleanupCustomer(customerId, pool).catch(console.error);
    }
    for (const saleId of salesToCleanup) {
      await cleanupSale(saleId, pool).catch(console.error);
    }
    await httpServer.close();
  });

  describe('POST /api/customers', () => {
    it('should create a new customer with valid data', async () => {
      const newCustomerData = {
        name: 'New Test Customer',
        email: `newtest${Date.now()}@example.com`,
        phone: '11987654321',
        address: 'Rua Teste, 123',
        cpf: `123456789${Date.now() % 100}`,
        birth_date: '1990-01-01T00:00:00Z',
      };

      const res = await request(httpServer)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCustomerData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      customersToCleanup.push(res.body.id);
    });
  });
  
  describe('Loyalty Points API', () => {
    let customerId: string;

    beforeEach(async () => {
      const pool = getPool();
      const customerRes = await pool.query(
        `INSERT INTO customers (name, email, loyalty_points) VALUES ($1, $2, $3) RETURNING id`,
        [`Loyalty Customer ${Date.now()}`, `loyalty${Date.now()}@example.com`, 100]
      );
      customerId = customerRes.rows[0].id;
      customersToCleanup.push(customerId);
    });

    it('should add loyalty points to a customer', async () => {
      const res = await request(httpServer)
        .post(`/api/customers/${customerId}/loyalty/add`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ points: 50 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.loyalty_points).toEqual(150);
    });

    it('should not subtract loyalty points below zero', async () => {
      const res = await request(httpServer)
        .post(`/api/customers/${customerId}/loyalty/subtract`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ points: 200 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.loyalty_points).toEqual(0);
    });
  });

  describe('Store Credit API', () => {
    let customerId: string;

    beforeEach(async () => {
      const pool = getPool();
      const customerRes = await pool.query(
        `INSERT INTO customers (name, email, store_credit_balance) VALUES ($1, $2, $3) RETURNING id`,
        [`Store Credit Customer ${Date.now()}`, `credit${Date.now()}@example.com`, 100.00]
      );
      customerId = customerRes.rows[0].id;
      customersToCleanup.push(customerId);
    });

    it('should add store credit to a customer', async () => {
      const res = await request(httpServer)
        .post(`/api/customers/${customerId}/store-credit/add`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 50.00, reason: 'Refund' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.store_credit_balance).toEqual('150.00');
    });

    it('should return 400 for insufficient store credit when deducting', async () => {
      const res = await request(httpServer)
        .post(`/api/customers/${customerId}/store-credit/deduct`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 200.00, reason: 'Large Purchase' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Insufficient store credit');
    });
  });
});
