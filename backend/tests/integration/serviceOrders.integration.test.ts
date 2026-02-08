import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Service Orders API Integration', () => {
  let adminToken: string;
  let server: any;
  let customerId: number;

  beforeAll(async () => {
    server = httpServer.listen(0);

    // Create Branch and Customer
    const pool = getPool();
    const branchRes = await pool.query(
      "INSERT INTO branches (name) VALUES ('Test Branch SO ' || random()) RETURNING id",
    );
    const branchId = branchRes.rows[0].id;

    const customerRes = await pool.query(
      "INSERT INTO customers (name, email, phone) VALUES ('Test Customer', 'customer' || random() || '@test.com', '11999999999') RETURNING id",
    );
    customerId = customerRes.rows[0].id;

    // Login and update admin branch
    await pool.query("UPDATE users SET branch_id = $1 WHERE email = 'admin@pdv.com'", [branchId]);

    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });

    adminToken = authRes.body.data.accessToken;
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
        customer_name: 'Test Customer',
        brand: 'Apple',
        product_description: 'Test Phone',
        imei: '998877665544332',
        issue_description: 'Screen is broken',
        services: [{ description: 'Screen Replacement', cost: 100 }],
        estimated_cost: 150,
        entry_checklist: { screen: 'broken', battery: 'ok' },
      });

    expect(response.status).toBe(201);
    const body = response.body.data || response.body;
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('Aguardando Avaliação');
  });
});
