import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Users API Integration', () => {
  let adminToken: string;
  let server: any;

  beforeAll(async () => {
    server = httpServer.listen(0);

    // Ensure role exists
    const pool = getPool();
    await pool.query("INSERT INTO roles (name) VALUES ('cashier') ON CONFLICT DO NOTHING");

    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });

    adminToken = authRes.body.accessToken;
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/users', () => {
    it('should list users (requires admin)', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should contain at least the admin
      expect(res.body.some((u: any) => u.email === 'admin@pdv.com')).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        password: 'password123',
        role: 'cashier',
      };

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      if (res.status !== 201) {
        console.log('Create User Failed:', res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(newUser.email);
    });
  });
});
