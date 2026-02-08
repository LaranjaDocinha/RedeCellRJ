import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app'; // Assumes app export exists
import { getPool } from '../../src/db';

describe('Auth Integration Flow', () => {
  // Clean up before tests
  beforeAll(async () => {
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE email = $1', ['test_integration@example.com']);
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE email = $1', ['test_integration@example.com']);
  });

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Integration Test User',
      email: 'test_integration@example.com',
      password: 'Password123!',
      roleName: 'user', // Assumes 'user' role exists
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test_integration@example.com');
  });

  it('should login with the registered user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test_integration@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test_integration@example.com',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
  });
});
