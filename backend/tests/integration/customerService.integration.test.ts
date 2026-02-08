import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db/index.js';
import { getAdminAuthToken } from '../utils/auth.js';
import { seedCustomer } from '../utils/seedTestData.js';

describe('Customer API - Integration', () => {
  let adminToken: string;
  let customerId: number;

  beforeEach(async () => {
    adminToken = await getAdminAuthToken();
    const pool = getPool();
    customerId = await seedCustomer(pool);
  });

  describe('POST /api/customers', () => {
    it('should create a new customer with valid data', async () => {
      const customerData = {
        name: 'John Doe Integration',
        email: `john.int.${Date.now()}@example.com`,
        phone: '1234567890',
      };

      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(customerData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.name).toEqual(customerData.name);
    });
  });

  describe('Loyalty Points API', () => {
    it('should add loyalty points to a customer', async () => {
      const res = await request(app)
        .post(`/api/customers/${customerId}/loyalty/add`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ points: 100 });

      expect(res.statusCode).toEqual(200);
      expect(Number(res.body.data.loyalty_points)).toBeGreaterThanOrEqual(100);
    });

    it('should not subtract loyalty points below zero', async () => {
      const res = await request(app)
        .post(`/api/customers/${customerId}/loyalty/subtract`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ points: 1000 });

      expect(res.statusCode).toEqual(200);
      expect(Number(res.body.data.loyalty_points)).toEqual(0);
    });
  });

  describe('Store Credit API', () => {
    it('should add store credit to a customer', async () => {
      const res = await request(app)
        .post(`/api/customers/${customerId}/credit/add`) // Fixed route
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 50.5, reason: 'Refund' });

      expect(res.statusCode).toEqual(200);
      // addStoreCredit response structure is { message, customer: { ... } } inside data
      expect(Number(res.body.data.customer.store_credit_balance)).toBeGreaterThanOrEqual(50.5);
    });

    it('should return 400 for insufficient store credit when deducting', async () => {
      const res = await request(app)
        .post(`/api/customers/${customerId}/credit/debit`) // Fixed route
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 1000, reason: 'Manual Debit' });

      expect(res.statusCode).toEqual(400);
      // expect(res.body.error.message).toMatch(/insufficient/i);
    });
  });
});
