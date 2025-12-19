import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { productService } from '../../../src/services/productService.js';
import redisClient from '../../../src/utils/redisClient.js';

// Mock Redis
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

describe('ProductService Extra Coverage', () => {
  let mockQuery: any;
  let mockClient: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockClient = (dbModule as any)._mockClient;
    vi.clearAllMocks();
    vi.mocked(redisClient.get).mockResolvedValue(null);
  });

  describe('updateProduct (Edge Cases)', () => {
    const productId = 1;
    const initialProduct = { id: productId, branch_id: 1, sku: 'PROD-1' };

    it('should delete removed variations', async () => {
        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 }) // SELECT product
            .mockResolvedValueOnce({ rows: [{ id: 101 }, { id: 102 }], rowCount: 2 }) // existingVariationsResult
            .mockResolvedValueOnce({}) // DELETE variations
            // Loop for variation 101 (kept)
            .mockResolvedValueOnce({ rows: [{ price: 10 }] }) // SELECT price (old)
            .mockResolvedValueOnce({}) // UPDATE variation
            .mockResolvedValueOnce({ rowCount: 1 }) // stockCheck
            .mockResolvedValueOnce({}) // UPDATE stock
            .mockResolvedValueOnce({}) // COMMIT

        // Mock final getProductById (product then variations)
        mockQuery
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 });

        // Enviar apenas variação 101, logo 102 deve ser deletada
        await productService.updateProduct(productId, { 
            variations: [{ id: 101, color: 'Red', price: 10, stock_quantity: 5 }] 
        });

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM product_variations WHERE id = ANY'),
            [[102]]
        );
    });

    it('should insert new variations during update', async () => {
        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 }) // SELECT product
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // No existing variations
            .mockResolvedValueOnce({ rows: [{ id: 201 }], rowCount: 1 }) // INSERT variation
            .mockResolvedValueOnce({}) // INSERT stock
            .mockResolvedValueOnce({}); // COMMIT

        mockQuery
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await productService.updateProduct(productId, { 
            variations: [{ color: 'Green', price: 20, stock_quantity: 10 }] 
        });

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO product_variations'),
            expect.any(Array)
        );
    });

    it('should insert stock record if it does not exist during update', async () => {
        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 }) // SELECT product
            .mockResolvedValueOnce({ rows: [{ id: 101 }], rowCount: 1 }) // existingVariations
            .mockResolvedValueOnce({ rows: [{ price: 5 }], rowCount: 1 }) // SELECT old price
            .mockResolvedValueOnce({}) // UPDATE variation
            .mockResolvedValueOnce({ rowCount: 0 }) // stockCheck (DOES NOT EXIST)
            .mockResolvedValueOnce({}) // INSERT stock (THE TARGET BRANCH)
            .mockResolvedValueOnce({}); // COMMIT

        mockQuery
            .mockResolvedValueOnce({ rows: [initialProduct], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await productService.updateProduct(productId, { 
            variations: [{ id: 101, color: 'Red', price: 10, stock_quantity: 5 }] 
        });

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO branch_product_variations_stock'),
            expect.any(Array)
        );
    });
  });
});
