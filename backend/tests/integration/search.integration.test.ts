import request from 'supertest';
import app from '../../src/index';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupIntegrationTestDatabase, teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';
import { authService } from '../../src/services/authService';

import { testPool } from '../testPool';

import { getTestPool } from '../testPool';

describe('Search API', () => {
  let authToken: string;

  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['users', 'products', 'product_variations', 'customers']);

    // Create a test user and get a token
    const userRes = await authService.register('testuser@search.com', 'password123', 'user');
    authToken = userRes.token;

    // Seed with a product. Using a unique SKU to avoid conflicts.
    await getTestPool().query(
      "INSERT INTO products (id, name, sku, product_type) VALUES (999, 'Test Search Product', 'SKU-SEARCH-999', 'physical') ON CONFLICT (id) DO UPDATE SET name = 'Test Search Product';"
    );
    // Seed with a customer
    await getTestPool().query(
      "INSERT INTO customers (id, name, email) VALUES (1, 'Test Customer', 'customer@example.com') ON CONFLICT (id) DO UPDATE SET name = 'Test Customer';"
    );
  });

  it('should return 400 if query parameter q is missing', async () => {
    const res = await request(app).get('/api/search');
    expect(res.statusCode).toEqual(400);
  });

  it('should return search results for products', async () => {
    const res = await request(app)
      .get('/api/search?q=Test Search')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('customers');
    expect(res.body.products).toHaveLength(1);
    expect(res.body.customers).toHaveLength(0); // Expect empty customers array
    expect(res.body.products[0].name).toBe('Test Search Product');
  });

  it('should return empty results if no match is found', async () => {
    const res = await request(app)
      .get('/api/search?q=nonexistent')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.products).toHaveLength(0);
    expect(res.body.customers).toHaveLength(0);
  });
});