import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import testPool from '../../src/db'; // Using a dedicated test pool
import { createProductRouter } from '../../src/routes/products';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../../src/middlewares/authMiddleware';
import errorMiddleware from '../../src/middlewares/errorMiddleware';
import { AuditService } from '../../src/services/auditService';

// Mock AuditService to prevent database interactions during tests
vi.mock('../../src/services/auditService', () => ({
  auditService: {
    recordAuditLog: vi.fn(() => Promise.resolve()), // Mock to do nothing
  },
}));

// Mock errorMiddleware to log errors during tests
vi.mock('../../src/middlewares/errorMiddleware.js', () => ({
  default: (err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error in errorMiddleware:', err);
    const statusCode = err.statusCode || 500;
    const responseBody: any = { message: err.message || 'Internal Server Error' };
    if (err.errors) {
      responseBody.errors = err.errors;
    }
    if (statusCode >= 400 && statusCode < 500) {
      responseBody.status = 'error';
    }
    res.status(statusCode).json(responseBody);
  },
}));

let app: express.Application;
let adminToken: string;
let userToken: string; // Adicionar userToken aqui
const newProductData = {
  name: 'Test Gadget',
  branch_id: 1,
  sku: 'TG-001',
  product_type: 'physical',
  variations: [
    { color: 'Black', price: 99.99, stock_quantity: 100 },
    { color: 'White', price: 109.99, stock_quantity: 50 },
  ],
};

  describe('Products API - Integration', () => {
    beforeAll(async () => {
      // Ensure tables are clean before starting
      await testPool.query('TRUNCATE TABLE users, products, product_variations, branches, sales, sale_items RESTART IDENTITY CASCADE');
    // Seed an admin user for authorization
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await testPool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      ['admin@example.com', hashedPassword, 'admin']
    );
    adminToken = jwt.sign(
      { 
        id: 1, 
        email: 'admin@example.com', 
        role: 'admin', 
        permissions: [
          { action: 'create', subject: 'product' },
          { action: 'read', subject: 'product' },
          { action: 'update', subject: 'product' },
          { action: 'delete', subject: 'product' },
        ] 
      }, 
      process.env.JWT_SECRET
    );

    // Seed a regular user for authorization tests
    await testPool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      ['user@example.com', hashedPassword, 'user']
    );
    userToken = jwt.sign(
      { 
        id: 2, 
        email: 'user@example.com', 
        role: 'user',
        permissions: [
          { action: 'read', subject: 'product' },
        ]
      }, 
      process.env.JWT_SECRET
    );

    // Seed necessary data, like branches
    await testPool.query("INSERT INTO branches (name) VALUES ('Main Branch'), ('Second Branch')");
  });

  beforeEach(async () => {
    vi.clearAllMocks(); // Clear all mocks before each test
    vi.resetModules(); // Reset module registry to ensure fresh imports of mocked modules

    // Clean tables before each test to ensure isolation
    await testPool.query('TRUNCATE TABLE products, product_variations RESTART IDENTITY CASCADE');

    // Setup app and router inside beforeEach to pick up fresh mocks
    app = express();
    app.use(express.json());
    app.use('/products', createProductRouter());
    app.use(errorMiddleware);
  });

  afterAll(async () => {
    // Close the pool connection
    await testPool.end();
  });

  describe('POST /products', () => {
    it('should create a new product and then fetch it', async () => {
      const createRes = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProductData);

      expect(createRes.statusCode).toEqual(201);
      expect(createRes.body).toHaveProperty('id');
      expect(createRes.body.name).toEqual(newProductData.name);
      expect(createRes.body.variations).toHaveLength(2);

      // 2. Fetch the product via API to verify creation
      const fetchRes = await request(app)
        .get(`/products/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(fetchRes.statusCode).toEqual(200);
      expect(fetchRes.body.name).toEqual(newProductData.name);
      expect(fetchRes.body.variations).toHaveLength(2);
      expect(fetchRes.body.variations[0].color).toEqual('Black');
    });

    it('should return 422 for invalid product data on creation', async () => {
      const invalidProduct = { name: '', branch_id: 1, sku: 'TG-001', product_type: 'physical', variations: [] }; // Invalid name, no variations
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct);

      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 403 if user is not authorized to create products', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newProductData);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'You do not have permission to create product');
    });
  });

  describe('GET /products', () => {
    it('should get all products', async () => {
      // Create some data first
      await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProductData);
      await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send({ ...newProductData, name: 'Product B', sku: 'PB-001' });

      const res = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(2);
    });

    it('should return an empty array if no products exist', async () => {
      const res = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /products/:id', () => {
    it('should get a product by ID', async () => {
      const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProductData);
      const productId = createRes.body.id;

      const fetchRes = await request(app)
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(fetchRes.statusCode).toEqual(200);
      expect(fetchRes.body.id).toEqual(productId);
      expect(fetchRes.body.name).toEqual(newProductData.name);
    });

    it('should return 404 if product is not found', async () => {
      const fetchRes = await request(app)
        .get('/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(fetchRes.statusCode).toEqual(404);
      expect(fetchRes.body).toHaveProperty('message', 'Product not found');
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProductData);
      const productId = createRes.body.id;
      const originalVariationId = createRes.body.variations[0].id;

      const updatedProductData = {
        name: 'Updated Name',
        variations: [
          { id: originalVariationId, color: 'Emerald Green', price: 55, stock_quantity: 45 }, // Update existing
          { color: 'New Yellow', price: 60, stock_quantity: 20 }, // Add new
        ],
      };

      const updateRes = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedProductData);

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.name).toEqual('Updated Name');
      expect(updateRes.body.variations).toHaveLength(2);
      
      // Verify the changes
      const updatedVariation = updateRes.body.variations.find((v: any) => v.id === originalVariationId);
      const newVariation = updateRes.body.variations.find((v: any) => v.color === 'New Yellow');
      
      expect(updatedVariation.color).toEqual('Emerald Green');
      expect(newVariation).toBeDefined();
    });

    it('should return 422 for invalid product data on update', async () => {
      const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProductData);
      const productId = createRes.body.id;

      const invalidUpdateData = { name: '', variations: [] }; // Invalid name, no variations
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 404 if product to update is not found', async () => {
      const updatedData = { name: 'Non Existent' };
      const res = await request(app)
        .put('/products/99999') // Non-existent ID
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Product not found');
    });

    it('should return 403 if user is not authorized to update products', async () => {
      const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProductData);
      const productId = createRes.body.id;

      const updatedData = { name: 'Unauthorized Update' };
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'You do not have permission to update product');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete an existing product', async () => {
      const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProductData);
      const productId = createRes.body.id;

      const deleteRes = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.statusCode).toEqual(204);

      // Verify it's gone
      const fetchRes = await request(app)
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(fetchRes.statusCode).toEqual(404);
    });

    it('should return 404 if product to delete is not found', async () => {
      const deleteRes = await request(app)
        .delete('/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.statusCode).toEqual(404);
      expect(deleteRes.body).toHaveProperty('message', 'Product not found');
    });

    it('should return 403 if user is not authorized to delete products', async () => {
      const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(newProductData);
      const productId = createRes.body.id;

      const res = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'You do not have permission to delete product');
    });
  });
});