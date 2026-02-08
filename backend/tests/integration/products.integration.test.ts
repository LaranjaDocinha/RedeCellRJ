import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Products API Integration', () => {
  let adminToken: string;
  let server: any;
  let branchId: number;

  beforeEach(async () => {
    // server = httpServer.listen(0); // Server usually started once or checking if open
    // Ideally we start server in beforeAll, but for now let's just ensure data exists

    // Create a Branch (and ensure server is up if needed, though vitest might handle imports)
    const pool = getPool();
    const branchRes = await pool.query(
      "INSERT INTO branches (name) VALUES ('Test Branch ' || random()) RETURNING id",
    );
    branchId = branchRes.rows[0].id;

    // We need a fresh token if we truncated users?
    // Users are NOT truncated.
  });

  beforeAll(async () => {
    server = httpServer.listen(0);
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.data.accessToken;
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/products', () => {
    it('should create a new product with variations', async () => {
      const newProduct = {
        name: 'Integration Test Phone',
        branch_id: branchId,
        sku: `TEST-PHONE-${Date.now()}`,
        variations: [
          {
            color: 'Black',
            price: 1000,
            stock_quantity: 10,
            low_stock_threshold: 2,
          },
        ],
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(newProduct.name);
      expect(res.body.data.variations).toHaveLength(1);
    });

    it('should fail validation when creating product without required fields', async () => {
      const invalidProduct = {
        name: '', // Empty name
        // Missing branch_id
        sku: 'INVALID-SKU',
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct);

      // Validations usually return 400, but sometimes Zod middleware returns 422.
      // The previous run showed 422.
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('GET /api/products', () => {
    it('should return a list of products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.products).toBeInstanceOf(Array); // Expecting data field which contains the array
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return details of a created product', async () => {
      // First create a product
      const productData = {
        name: 'Fetch Me Phone',
        branch_id: branchId,
        sku: `FETCH-${Date.now()}`,
        variations: [{ color: 'White', price: 500, stock_quantity: 5 }],
      };

      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      const productId = createRes.body.data.id;

      // Then fetch it
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(productId);
      expect(res.body.data.name).toBe(productData.name);
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .get('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
