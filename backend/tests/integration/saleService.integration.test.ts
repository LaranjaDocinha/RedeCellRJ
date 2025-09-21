import { saleService } from '../../src/services/saleService';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { setupIntegrationTestDatabase, teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';

import { getTestPool } from '../testPool';

describe('saleService - Integration', () => {



  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['branches', 'products', 'product_variations', 'sales', 'sale_items']);
    // Seed ONLY the data needed for THIS test
    await getTestPool().query("INSERT INTO branches (id, name) VALUES (1, 'Test Branch') ON CONFLICT (id) DO NOTHING;");
    await getTestPool().query(
      `INSERT INTO products (id, name, description, sku, branch_id) VALUES (1, 'Test Product', 'A product for testing', 'SALE-TEST-001', 1) ON CONFLICT (id) DO NOTHING;`
    );
    await getTestPool().query(
      `INSERT INTO product_variations (id, product_id, color, stock_quantity, price)
      VALUES (1, 1, 'Blue', 10, 99.99) ON CONFLICT (id) DO NOTHING;`
    );
  });

  it('should create a sale and correctly update stock', async () => {
    // Arrange: Define the sale items
    const items = [
      { product_id: 1, variation_id: 1, quantity: 2 },
    ];

    // Act: Call the actual service method. Because of the vi.mock at the top,
    // it will use our testPool that connects to the test container.
    const result = await saleService.createSale(null, items);

    // Assert: Check the result from the service
    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.total_amount).toBe(199.98); // 2 * 99.99
    expect(result.items.length).toBe(1);

    // Assert: Check the database state directly
    const { rows } = await getTestPool().query('SELECT stock_quantity FROM product_variations WHERE id = 1;');
    expect(rows[0].stock_quantity).toBe(8); // 10 - 2
  });
});
