import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../../../src/services/productService.js';
import { productRepository } from '../../../src/repositories/product.repository.js';

// Local mock to ensure control
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
  },
}));

describe('ProductService Extra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProduct (Edge Cases)', () => {
    it('should delete removed variations', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue({
        id: 1,
        sku: 'S',
        branch_id: 1,
      } as any);
      vi.mocked(productRepository.getVariationIds).mockResolvedValue([10, 20]);

      await productService.updateProduct(1, {
        variations: [{ id: 10, color: 'Red', price: 100, stock_quantity: 5 }],
      });

      expect(productRepository.deleteVariations).toHaveBeenCalledWith([20], expect.anything());
    });

    it('should insert new variations during update', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue({
        id: 1,
        sku: 'S',
        branch_id: 1,
      } as any);
      vi.mocked(productRepository.getVariationIds).mockResolvedValue([]);

      await productService.updateProduct(1, {
        variations: [{ color: 'Blue', price: 200, stock_quantity: 10 }],
      });

      expect(productRepository.createVariation).toHaveBeenCalled();
    });
  });
});
