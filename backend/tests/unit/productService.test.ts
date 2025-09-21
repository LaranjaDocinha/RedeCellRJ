import { vi } from 'vitest';

const mockQuery = vi.fn();

vi.mock('../../src/db/index.js', () => ({
  default: {
    query: mockQuery,
  },
}));

describe('productService', () => {
  let productService: any;

  beforeAll(async () => {
    // Dynamically import productService after mocks are defined
    const module = await import('../../src/services/productService.js');
    productService = module.productService;
  });

  afterAll(() => {
    // Clean up mocks after all tests are done
    vi.restoreAllMocks(); // Vitest equivalent of jest.unmock and jest.restoreAllMocks
  });

  beforeEach(() => {
    // Clears all mocks, including mockQuery
    vi.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return a list of products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product A', description: 'Desc A', sku: 'SKU001' },
        { id: 2, name: 'Product B', description: 'Desc B', sku: 'SKU002' },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockProducts });

      const products = await productService.getAllProducts();

      expect(products).toEqual(mockProducts);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith('SELECT id, name, description, sku, branch_id FROM products ORDER BY name ASC');
    });

    it('should return an empty array if no products are found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const products = await productService.getAllProducts();

      expect(products).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  // Add more describe blocks for other productService methods (createProduct, updateProduct, deleteProduct, getProductById)
  // and implement their respective tests with appropriate mocking for pool.connect() and client.query()
});