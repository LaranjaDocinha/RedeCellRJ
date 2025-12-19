import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { setupTestCleanup } from '../setupTestCleanup';
import { getPool } from '../../src/db';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Service Orders API Integration', () => {
  let adminToken: string;
  let server: any;
  let customerId: number;

  setupTestCleanup();

  beforeAll(async () => {
    server = httpServer.listen(0);
    
    // Create Customer
    const pool = getPool();
    const customerRes = await pool.query(
      "INSERT INTO customers (name, email, phone) VALUES ('Test Customer', 'customer@test.com', '11999999999') RETURNING id"
    );
    customerId = customerRes.rows[0].id;

    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    
    adminToken = authRes.body.token;
  });

  afterAll(async () => {
    await server.close();
  });

  it('should create a new service order', async () => {
    const response = await request(app)
      .post('/api/service-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_id: customerId,
        product_description: 'Test Phone',
        imei: '998877665544332',
        issue_description: 'Screen is broken',
        entry_checklist: { "screen": "broken", "battery": "ok" }
      });
      
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('Aguardando Avaliação');
  });
});
