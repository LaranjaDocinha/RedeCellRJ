import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { getPool } from '../../src/db/index';
import { seedCustomer } from '../utils/seedTestData';

describe('Store Credit Controller', () => {
  let adminToken: string;
  let customerId: number;

  beforeAll(async () => {
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.accessToken;
  });

  beforeEach(async () => {
    const pool = getPool();
    customerId = await seedCustomer(pool);
  });

  it('should add store credit to a customer', async () => {
    const res = await request(app)
      .post(`/api/customers/${customerId}/credit/add`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100, reason: 'Refund' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toMatch(/credit/i);
  });

  it('should debit store credit from a customer', async () => {
    // Add credit first
    await request(app)
      .post(`/api/customers/${customerId}/credit/add`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100, reason: 'Initial' });

    const res = await request(app)
      .post(`/api/customers/${customerId}/credit/debit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 50, reason: 'Purchase' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toMatch(/debit/i);
  });

  it('should not debit store credit if insufficient balance', async () => {
    const res = await request(app)
      .post(`/api/customers/${customerId}/credit/debit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 1000, reason: 'Big purchase' });

    expect(res.statusCode).toBe(400);
    expect(res.body.data.message).toMatch(/insuficiente|insufficient/i);
  });

  it('should get store credit history for a customer', async () => {
    const res = await request(app)
      .get(`/api/customers/${customerId}/credit/history`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.history)).toBe(true);
  });
});
