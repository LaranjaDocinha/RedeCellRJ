import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { productService } from '../../../src/services/productService.js';
import redisClient from '../../../src/utils/redisClient.js';

vi.mock('../../../src/utils/redisClient.js', () => ({
  default: {
    get: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock('../../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
  };
});

describe('ProductService Extreme Coverage', () => {
  let mockQuery: any;
  let mockClient: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockClient = (dbModule as any)._mockClient;
    vi.clearAllMocks();
    vi.mocked(redisClient.get).mockResolvedValue(null);
  });

  describe('updateProduct (Complete Branch Coverage)', () => {
    const productId = 1;
    const initialProduct = { id: productId, branch_id: 1, sku: 'PROD-1', name: 'Old' };
    const existingVar = { id: 101, color: 'Red', price: 100, stock_quantity: 5 };

    it('should update all product fields and variations branches', async () => {
        // Logic sequence:
        // 1. BEGIN
        // 2. SELECT product
        // 3. UPDATE product (if fields changed)
        // 4. SELECT existing variations
        // 5. DELETE removed variations
        // 6. Loop variations:
        //    a. SELECT price (for existing)
        //    b. UPDATE variation
        //    c. SELECT 1 from stock (stockCheck)
        //    d. UPDATE/INSERT stock
        //    e. INSERT price history (if price changed)
        // 7. COMMIT
        // 8. getProductById final

        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 }) // SELECT product
            .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE products
            .mockResolvedValueOnce({ rows: [existingVar], rowCount: 1 }) // SELECT id FROM variations
            // Loop for var 101 (existing, price changed)
            .mockResolvedValueOnce({ rows: [{ price: 100 }] }) // SELECT price old
            .mockResolvedValueOnce({}) // UPDATE variation
            .mockResolvedValueOnce({ rowCount: 1 }) // stockCheck (exists)
            .mockResolvedValueOnce({}) // UPDATE stock
            .mockResolvedValueOnce({}) // INSERT price history
            // Loop for new var (no id)
            .mockResolvedValueOnce({ rows: [{ id: 201 }] }) // INSERT new variation
            .mockResolvedValueOnce({}) // INSERT stock for new var
            .mockResolvedValueOnce({}); // COMMIT

        // getProductById at end
        mockQuery
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const payload = {
            name: 'New Name',
            is_serialized: true,
            branch_id: 2,
            variations: [
                { id: 101, color: 'Red', price: 120, stock_quantity: 8, storage_capacity: '64GB' }, // Updated
                { color: 'Blue', price: 200, stock_quantity: 10 } // New
            ]
        };

        await productService.updateProduct(productId, payload);

        // Verify all expected queries were called
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE products SET name = $1, is_serialized = $2, branch_id = $3'), expect.any(Array));
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO price_history'), expect.any(Array));
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO product_variations'), expect.any(Array));
    });

    it('should return undefined if product to update not found', async () => {
        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT product (Empty)
        
        await expect(productService.updateProduct(999, { name: 'X' })).rejects.toThrow('Product not found');
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getAllProductVariations', () => {
      it('should return formatted variations', async () => {
          mockQuery.mockResolvedValueOnce({ rows: [
              { id: 1, sku: 'SKU1', product_name: 'P1', variation_name: 'V1' },
              { id: 2, sku: 'SKU2', product_name: 'P2', variation_name: null }
          ] });

          const result = await productService.getAllProductVariations();
          expect(result).toHaveLength(2);
          expect(result[0].name).toBe('P1 (V1)');
          expect(result[1].name).toBe('P2 (SKU2)');
      });
  });
});
