import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../../../src/services/productService.js';
import { productRepository } from '../../../src/repositories/product.repository.js';

vi.mock('../../../src/db/index.js', () => {
  const mockClient = {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: vi.fn(),
  };
  const mockPool = {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: vi.fn().mockResolvedValue(mockClient),
  };
  return {
    getPool: vi.fn(() => mockPool),
    default: mockPool,
    query: mockPool.query,
    connect: mockPool.connect,
  };
});

vi.mock('../../../src/repositories/product.repository.js', () => ({
  productRepository: {
    findById: vi.fn(),
    updateProduct: vi.fn(),
    getVariationIds: vi.fn(),
    deleteVariations: vi.fn(),
    getVariationPrice: vi.fn(),
    updateVariation: vi.fn(),
    createOrUpdateStock: vi.fn(),
    recordPriceHistory: vi.fn(),
    createVariation: vi.fn(),
    findAllVariations: vi.fn(),
  },
}));

describe('ProductService Extreme Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProduct (Complete Branch Coverage)', () => {
    it('should update all product fields and variations branches', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue({
        id: 1,
        sku: 'SKU',
        branch_id: 1,
      } as any);
      vi.mocked(productRepository.getVariationIds).mockResolvedValue([10]);
      vi.mocked(productRepository.getVariationPrice).mockResolvedValue(50);

      await productService.updateProduct(1, {
        name: 'New Name',
        is_serialized: true,
        branch_id: 2,
        variations: [
          { id: 10, color: 'Green', price: 60, stock_quantity: 20 }, // Update
          { color: 'Yellow', price: 70, stock_quantity: 30 }, // New
        ],
      });

      expect(productRepository.updateProduct).toHaveBeenCalled();
      expect(productRepository.updateVariation).toHaveBeenCalled();
      expect(productRepository.createVariation).toHaveBeenCalled();
      expect(productRepository.recordPriceHistory).toHaveBeenCalled();
    });

    it('should return undefined if product to update not found', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue(null);
      await expect(productService.updateProduct(999, { name: 'X' })).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('getAllProductVariations', () => {
    it('should return formatted variations', async () => {
      vi.mocked(productRepository.findAllVariations).mockResolvedValue([
        { id: 1, sku: 'S1', product_name: 'P1', variation_name: 'V1' },
      ]);
      const res = await productService.getAllProductVariations();
      expect(res[0].name).toContain('P1');
    });
  });
});
