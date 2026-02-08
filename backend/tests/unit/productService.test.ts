import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define mocks before everything
const mocks = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
  };
  return { mockClient, mockPool };
});

// Mock dependencies
vi.mock('../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
  query: mocks.mockPool.query,
  connect: mocks.mockPool.connect,
}));

vi.mock('../../src/utils/redisClient.js', () => ({
  default: {
    get: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock('../../src/services/dynamicPricingService.js', () => ({
  dynamicPricingService: {
    getSuggestedUsedProductPrice: vi.fn(),
  },
}));

vi.mock('../../src/repositories/product.repository.js', () => ({
  productRepository: {
    count: vi.fn(),
    findAll: vi.fn(),
    findAllVariations: vi.fn(),
    findById: vi.fn(),
    createProduct: vi.fn(),
    createVariation: vi.fn(),
    createOrUpdateStock: vi.fn(),
    updateProduct: vi.fn(),
    getVariationIds: vi.fn(),
    deleteVariations: vi.fn(),
    getVariationPrice: vi.fn(),
    updateVariation: vi.fn(),
    recordPriceHistory: vi.fn(),
    delete: vi.fn(),
    getPriceHistory: vi.fn(),
  },
}));

vi.mock('../../src/utils/auditLogger.js', () => ({
  auditLogger: {
    logUpdate: vi.fn().mockResolvedValue(undefined),
    logCreate: vi.fn().mockResolvedValue(undefined),
    logDelete: vi.fn().mockResolvedValue(undefined),
  },
}));

import { productService } from '../../src/services/productService.js';
import { productRepository } from '../../src/repositories/product.repository.js';
import redisClient from '../../src/utils/redisClient.js';
import { dynamicPricingService } from '../../src/services/dynamicPricingService.js';

describe('ProductService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mocks.mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('getAllProducts', () => {
    it('should return all products with pagination', async () => {
      vi.mocked(productRepository.count).mockResolvedValue(1);
      vi.mocked(productRepository.findAll).mockResolvedValue([{ id: 1, name: 'Product A' } as any]);

      const options = { search: 'Product', limit: 10, offset: 0 };
      const result = await productService.getAllProducts(options);

      expect(result.products).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });
  });

  describe('getAllProductVariations', () => {
    it('should return mapped variations', async () => {
      vi.mocked(productRepository.findAllVariations).mockResolvedValue([
        { id: 1, sku: 'S1', product_name: 'P1', variation_name: 'V1' }
      ] as any);
      const res = await productService.getAllProductVariations();
      expect(res[0].name).toContain('P1 (V1)');
    });
  });

  describe('getProductById', () => {
    it('should return cached product if available', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce(JSON.stringify({ id: 1, name: 'Cached' }));
      const res = await productService.getProductById(1);
      expect(res.name).toBe('Cached');
      expect(productRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repo and cache if not in redis', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce(null);
      vi.mocked(productRepository.findById).mockResolvedValue({ id: 1, name: 'Repo' } as any);
      const res = await productService.getProductById(1);
      expect(res.name).toBe('Repo');
      expect(redisClient.setEx).toHaveBeenCalled();
    });
  });

  describe('createProduct', () => {
    const productData = {
      name: 'Test',
      branch_id: 1,
      sku: 'SKU123',
      variations: [{ color: 'Red', price: 100, stock_quantity: 10 }],
    };

    it('should create a product and its variations successfully', async () => {
      vi.mocked(productRepository.createProduct).mockResolvedValue(1);
      vi.mocked(productRepository.findById).mockResolvedValue({ id: 1, name: 'Test' } as any);

      const result = await productService.createProduct(productData);

      expect(result).toBeDefined();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      vi.mocked(productRepository.createProduct).mockRejectedValue(new Error('DB Error'));
      await expect(productService.createProduct(productData)).rejects.toThrow('DB Error');
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('updateProduct', () => {
    it('should update product and its variations complexly', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue({
        id: 1,
        sku: 'SKU1',
        branch_id: 1,
      } as any);
      vi.mocked(productRepository.getVariationIds).mockResolvedValue([10, 11]);
      vi.mocked(productRepository.getVariationPrice).mockResolvedValue(100);

      const updateData = {
        name: 'New Name',
        variations: [
          { id: 10, color: 'Red', price: 120, stock_quantity: 5 }, // Update existing, price change
          { color: 'Blue', price: 50, stock_quantity: 20 } // New variation
        ]
      };

      await productService.updateProduct(1, updateData);

      expect(productRepository.updateProduct).toHaveBeenCalled();
      expect(productRepository.deleteVariations).toHaveBeenCalledWith([11], expect.anything()); // 11 is missing from update
      expect(productRepository.updateVariation).toHaveBeenCalledWith(10, 'Red', 120, expect.anything());
      expect(productRepository.recordPriceHistory).toHaveBeenCalled();
      expect(productRepository.createVariation).toHaveBeenCalled();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product and log audit', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue({ id: 1 } as any);
      vi.mocked(productRepository.delete).mockResolvedValue(true);
      await productService.deleteProduct(1);
      expect(productRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Extra methods', () => {
    it('getProductPriceHistory should call repo', async () => {
      await productService.getProductPriceHistory(1, 10);
      expect(productRepository.getPriceHistory).toHaveBeenCalledWith(10);
    });

    it('getSuggestedUsedProductPrice should call dynamicPricingService', async () => {
      vi.mocked(dynamicPricingService.getSuggestedUsedProductPrice).mockResolvedValue(150);
      const res = await productService.getSuggestedUsedProductPrice(1);
      expect(res).toBe(150);
    });
  });
});
