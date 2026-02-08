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

// Now import the service
import { productService } from '../../src/services/productService.js';
import { productRepository } from '../../src/repositories/product.repository.js';

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
      expect(mocks.mockClient.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      vi.mocked(productRepository.createProduct).mockRejectedValue(new Error('DB Error'));
      await expect(productService.createProduct(productData)).rejects.toThrow('DB Error');
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('updateProduct', () => {
    it('should update product details', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue({
        id: 1,
        sku: 'S',
        branch_id: 1,
      } as any);

      await productService.updateProduct(1, { name: 'New' });

      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(productRepository.updateProduct).toHaveBeenCalled();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });
});
