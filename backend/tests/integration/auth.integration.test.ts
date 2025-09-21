import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import authRouter from '../../src/routes/auth.js';
import testPool from '../../src/db';
import { authService } from '../../src/services/authService.js';
import jwt from 'jsonwebtoken';

// Mock middlewares to isolate the authRouter logic
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  authMiddleware: {
    authenticate: (req: any, res: any, next: any) => next(),
    authorize: (roles: any) => (req: any, res: any, next: any) => next(),
  },
}));

vi.mock('../../src/middlewares/errorMiddleware.js', () => ({
  default: (err: any, req: any, res: any, next: any) => {
    // For integration tests, we want the actual error to propagate for assertions
    next(err);
  },
}));

// Mock jsonwebtoken to control token generation/verification in authService
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock_jwt_token'),
    verify: vi.fn(() => ({ id: 1, email: 'test@example.com', role: 'user' })),
  },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth API - Integration', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret'; // Set a mock JWT secret
    // Ensure tables are clean before starting
    await testPool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });

  beforeEach(async () => {
    // Clean tables before each test to ensure isolation
    await testPool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    // Close the pool connection
    await testPool.end();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toEqual(testUser.email);
      expect(res.body).toHaveProperty('token');
      expect(res.body.token).toEqual('mock_jwt_token');

      // Verify user in DB
      const dbRes = await testPool.query('SELECT * FROM users WHERE email = $1', [testUser.email]);
      expect(dbRes.rowCount).toEqual(1);
    });

    it('should return 422 for invalid registration data', async () => {
      const invalidUser = { email: 'invalid-email', password: '123' }; // Invalid email and short password
      const res = await request(app)
        .post('/auth/register')
        .send(invalidUser);

      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return an error if email already exists', async () => {
      // Register first user
      await request(app).post('/auth/register').send(testUser);

      // Attempt to register again with same email
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(400); // Assuming authService returns 400 for duplicate email
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Email already registered');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await authService.register(testUser.email, testUser.password, 'user');
    });

    it('should log in a user successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send(testUser);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toEqual(testUser.email);
      expect(res.body).toHaveProperty('token');
      expect(res.body.token).toEqual('mock_jwt_token');
    });

    it('should return 401 for invalid login credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      await testPool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE'); // Ensure no user exists
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'anypassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
