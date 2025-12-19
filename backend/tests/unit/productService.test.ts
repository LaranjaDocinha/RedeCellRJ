import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../utils/dbMock.js';
import { AppError, NotFoundError } from '../../src/utils/errors.js';

// Mock do dynamicPricingService
vi.mock('../../src/services/dynamicPricingService.js', () => ({
  dynamicPricingService: {
    getSuggestedUsedProductPrice: vi.fn(),
  },
}));

// Mock do Redis
vi.mock('../../src/utils/redisClient.js', () => ({
  default: {
    get: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
  },
}));

// Mock do pool do PostgreSQL
vi.mock('../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

// Importar o serviço APÓS os mocks
import { productService } from '../../src/services/productService.js';
import redisClient from '../../src/utils/redisClient.js';
import { dynamicPricingService } from '../../src/services/dynamicPricingService.js';

describe('ProductService', () => {
  let mockQuery: any;
  let mockConnect: any;
  let mockClient: any;

  beforeEach(async () => {
    const dbModule = await import('../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;
    mockClient = (dbModule as any)._mockClient;

    vi.clearAllMocks();
    
    // Default robust implementation
    mockQuery.mockImplementation(async (sql: string, params: any[]) => {
        if (sql.includes('SELECT COUNT')) return { rows: [{ count: '0' }], rowCount: 1 };
        if (sql.includes('SELECT') && sql.includes('FROM products')) return { rows: [], rowCount: 0 };
        if (sql.includes('INSERT INTO products')) return { rows: [{ id: 1 }], rowCount: 1 };
        return { rows: [], rowCount: 0 };
    });

    mockConnect.mockResolvedValue(mockClient);
    
    vi.mocked(redisClient.get).mockClear();
    vi.mocked(redisClient.setEx).mockClear();
    vi.mocked(dynamicPricingService.getSuggestedUsedProductPrice).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return all products with pagination and filters', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
          if (sql.includes('SELECT COUNT')) return { rows: [{ count: '1' }], rowCount: 1 };
          if (sql.includes('SELECT') && sql.includes('FROM products')) return { rows: [{ id: 1, name: 'Product A' }], rowCount: 1 };
          return { rows: [], rowCount: 0 };
      });

      const options = { search: 'Product', limit: 10, offset: 0 };
      const result = await productService.getAllProducts(options);

      expect(result.products).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });
  });

  describe('getProductById', () => {
    const mockProduct = { id: 1, name: 'Product A', branch_id: 1 };
    const mockVariations = [{ id: 101, color: 'Red' }];

    it('should return product from cache if available', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce(JSON.stringify({ ...mockProduct, variations: mockVariations }));

      const product = await productService.getProductById(1);
      expect(product).toEqual({ ...mockProduct, variations: mockVariations });
    });

    it('should fetch from DB and cache if not in cache', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce(null);
      mockQuery.mockImplementation(async (sql: string) => {
          if (sql.includes('FROM products')) return { rows: [mockProduct], rowCount: 1 };
          if (sql.includes('FROM product_variations')) return { rows: mockVariations, rowCount: 1 };
          return { rows: [], rowCount: 0 };
      });

      const product = await productService.getProductById(1);
      expect(product.name).toBe('Product A');
      expect(redisClient.setEx).toHaveBeenCalled();
    });
  });

  describe('createProduct', () => {
    const productData = {
      name: 'Smartphone Teste',
      branch_id: 1,
      sku: 'SMART-001',
      variations: [
        { color: 'Black', price: 1000, stock_quantity: 10, low_stock_threshold: 2 },
      ],
    };

    it('should create a product and its variations successfully', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
          if (sql === 'BEGIN' || sql === 'COMMIT') return {};
          if (sql.includes('INSERT INTO products')) return { rows: [{ id: 1 }], rowCount: 1 };
          if (sql.includes('INSERT INTO product_variations')) return { rows: [{ id: 101 }], rowCount: 1 };
          if (sql.includes('INSERT INTO branch_product_variations_stock')) return {};
          if (sql.includes('FROM products')) return { rows: [{ id: 1, name: 'New' }], rowCount: 1 };
          if (sql.includes('FROM product_variations')) return { rows: [], rowCount: 0 };
          return { rows: [], rowCount: 0 };
      });

      const result = await productService.createProduct(productData);
      expect(result).toBeDefined();
    });
  });

  describe('updateProduct', () => {
    const productId = 1;
    const initialProduct = { id: productId, name: 'Old Name', sku: 'OLD-SKU', branch_id: 1, variations: [{ id: 101, color: 'Blue', price: 500, stock_quantity: 5 }] };

    it('should update product details', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
          if (sql === 'BEGIN' || sql === 'COMMIT') return {};
          if (sql.includes('SELECT * FROM products')) return { rows: [initialProduct], rowCount: 1 };
          if (sql.includes('UPDATE products')) return { rowCount: 1 };
          if (sql.includes('FROM product_variations')) return { rows: [], rowCount: 0 };
          return { rows: [], rowCount: 0 };
      });

      const result = await productService.updateProduct(productId, { name: 'New Name' });
      expect(result).toBeDefined();
    });

    it('should handle variations update and price history', async () => {
        const updatedVariation = { id: 101, color: 'Blue', price: 600, stock_quantity: 10 };

        mockQuery.mockImplementation(async (sql: string) => {
            if (sql === 'BEGIN' || sql === 'COMMIT') return {};
            if (sql.includes('SELECT * FROM products')) return { rows: [initialProduct], rowCount: 1 };
            // Return existing variations to populate existingVariationIds
            if (sql.includes('SELECT id FROM product_variations')) return { rows: [{ id: 101 }], rowCount: 1 };
            
            // This query is inside the loop, inside the 'if' block
            if (sql.includes('SELECT price FROM product_variations')) return { rows: [{ price: 500 }], rowCount: 1 };
            
            if (sql.includes('UPDATE product_variations')) return { rowCount: 1 };
            
            // Stock check
            if (sql.includes('branch_product_variations_stock')) {
                 if (sql.trim().toUpperCase().startsWith('SELECT 1')) return { rowCount: 1 };
                 return { rowCount: 1 }; // For UPDATE/INSERT stock
            }
            
            if (sql.includes('INSERT INTO price_history')) return { rowCount: 1 };
            
            // Final getProductById calls
            // 1. Get product
            if (sql.includes('SELECT * FROM products')) return { rows: [initialProduct], rowCount: 1 };
            // 2. Get variations
            if (sql.includes('FROM product_variations')) return { rows: [], rowCount: 0 };
            
            return { rows: [], rowCount: 0 };
        });

        await productService.updateProduct(productId, { variations: [updatedVariation] });
        
        // Verify that price history insert was called
        const calls = mockQuery.mock.calls;
        const priceHistoryCall = calls.find((call: any[]) => call[0].includes('INSERT INTO price_history'));
        expect(priceHistoryCall).toBeDefined();
    });
  });

  describe('deleteProduct', () => {
    it('should return true if product deleted', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      const result = await productService.deleteProduct(1);
      expect(result).toBe(true);
    });
  });

  describe('getProductPriceHistory', () => {
    it('should return price history', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
          if (sql.includes('FROM price_history')) return { rows: [{ id: 1 }], rowCount: 1 };
          return { rows: [], rowCount: 0 };
      });
      const result = await productService.getProductPriceHistory(1, 101);
      expect(result).toHaveLength(1);
    });
  });
});