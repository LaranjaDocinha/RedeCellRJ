import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import customersRouter from '../../src/routes/customers.js';
import testPool from '../../src/db';
import { authService } from '../../src/services/authService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock middlewares to isolate the customersRouter logic
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  authMiddleware: {
    authenticate: (req: any, res: any, next: any) => {
      req.user = { id: 1, email: 'admin@example.com', role: 'admin' }; // Mock authenticated admin user
      next();
    },
    authorize: (roles: string[], resource?: string) => (req: any, res: any, next: any) => {
      // For simplicity in integration tests, assume admin can do anything
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
    },
  },
}));

vi.mock('../../src/middlewares/errorMiddleware.js', () => ({
  default: (err: any, req: any, res: any, next: any) => {
    // For integration tests, we want the actual error to propagate for assertions
    next(err);
  },
}));

// Mock jsonwebtoken if authService uses it for token generation
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock_jwt_token'),
    verify: vi.fn(() => ({ id: 1, email: 'admin@example.com', role: 'admin' })),
  },
}));

const app = express();
app.use(express.json());
app.use('/customers', customersRouter);

describe('Customers API - Integration', () => {
  const testCustomer = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    address: '123 Main St',
  };

  let adminToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret'; // Set a mock JWT secret
    // Ensure tables are clean before starting
    await testPool.query('TRUNCATE TABLE users, customers RESTART IDENTITY CASCADE');

    // Seed an admin user for authorization
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await testPool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      ['admin@example.com', hashedPassword, 'admin']
    );
    adminToken = jwt.sign({ id: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET);
  });

  beforeEach(async () => {
    // Clean customers table before each test to ensure isolation
    await testPool.query('TRUNCATE TABLE customers RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    // Close the pool connection
    await testPool.end();
  });

  describe('POST /customers', () => {
    it('should create a new customer successfully', async () => {
      const res = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testCustomer);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(testCustomer.name);
      expect(res.body.email).toEqual(testCustomer.email);

      // Verify customer in DB
      const dbRes = await testPool.query('SELECT * FROM customers WHERE id = $1', [res.body.id]);
      expect(dbRes.rowCount).toEqual(1);
    });

    it('should return 422 for invalid customer data', async () => {
      const invalidCustomer = { name: '', email: 'invalid-email' }; // Invalid name and email
      const res = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCustomer);

      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 403 if user is not authorized to create customers', async () => {
      // Mock authMiddleware to return a non-admin user
      vi.mock('../../src/middlewares/authMiddleware.js', () => ({
        authMiddleware: {
          authenticate: (req: any, res: any, next: any) => {
            req.user = { id: 2, email: 'user@example.com', role: 'user' }; // Mock authenticated regular user
            next();
          },
          authorize: (roles: string[], resource?: string) => (req: any, res: any, next: any) => {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
          },
        },
      }));

      const res = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testCustomer);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Forbidden: Insufficient permissions');
    });
  });

  describe('GET /customers', () => {
    it('should get all customers successfully', async () => {
      // Create some customers first
      await request(app).post('/customers').set('Authorization', `Bearer ${adminToken}`).send(testCustomer);
      await request(app).post('/customers').set('Authorization', `Bearer ${adminToken}`).send({ ...testCustomer, email: 'jane.doe@example.com' });

      const res = await request(app)
        .get('/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /customers/:id', () => {
    it('should get a customer by ID successfully', async () => {
      // Create a customer first
      const createRes = await request(app).post('/customers').set('Authorization', `Bearer ${adminToken}`).send(testCustomer);
      const customerId = createRes.body.id;

      const res = await request(app)
        .get(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', customerId);
      expect(res.body.name).toEqual(testCustomer.name);
    });

    it('should return 404 if customer is not found', async () => {
      const res = await request(app)
        .get('/customers/99999') // Non-existent ID
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Customer not found');
    });
  });

  describe('PUT /customers/:id', () => {
    it('should update a customer by ID successfully', async () => {
      // Create a customer first
      const createRes = await request(app).post('/customers').set('Authorization', `Bearer ${adminToken}`).send(testCustomer);
      const customerId = createRes.body.id;

      const updatedData = { name: 'Jane Doe Updated', phone: '0987654321' };
      const res = await request(app)
        .put(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', customerId);
      expect(res.body.name).toEqual(updatedData.name);
      expect(res.body.phone).toEqual(updatedData.phone);

      // Verify update in DB
      const dbRes = await testPool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
      expect(dbRes.rows[0].name).toEqual(updatedData.name);
    });

    it('should return 404 if customer to update is not found', async () => {
      const updatedData = { name: 'Non Existent' };
      const res = await request(app)
        .put('/customers/99999') // Non-existent ID
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Customer not found');
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete a customer by ID successfully', async () => {
      // Create a customer first
      const createRes = await request(app).post('/customers').set('Authorization', `Bearer ${adminToken}`).send(testCustomer);
      const customerId = createRes.body.id;

      const res = await request(app)
        .delete(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(204);

      // Verify deletion in DB
      const dbRes = await testPool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
      expect(dbRes.rowCount).toEqual(0);
    });

    it('should return 404 if customer to delete is not found', async () => {
      const res = await request(app)
        .delete('/customers/99999') // Non-existent ID
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Customer not found');
    });
  });
});
