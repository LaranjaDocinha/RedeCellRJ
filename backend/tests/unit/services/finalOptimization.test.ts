import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../../../src/services/productService.js';
import { productRepository } from '../../../src/repositories/product.repository.js';
import { discountService } from '../../../src/services/discountService.js';
import { ipWhitelistService } from '../../../src/services/ipWhitelistService.js';

vi.mock('../../../src/repositories/product.repository.js', () => ({
  productRepository: {
    findById: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Final Optimization Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProductService Final', () => {
    it('should return false if product not found for delete', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue(null);
      vi.mocked(productRepository.delete).mockResolvedValue(false);

      const res = await productService.deleteProduct(999);
      expect(res).toBe(false);
    });
  });
});
