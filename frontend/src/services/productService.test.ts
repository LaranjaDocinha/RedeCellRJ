import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productService from './productService';

describe('ProductService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  const mockToken = 'test-token';

  it('should fetch all products with correct params', async () => {
    const mockResponse = { products: [{ id: 1, name: 'iPhone' }], totalCount: 1 };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await productService.fetchAllProducts(mockToken, 'iPhone', undefined, 1, 10);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('search=iPhone'),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${mockToken}` }
      })
    );
    expect(result.products).toEqual(mockResponse.products);
  });

  it('should create a product', async () => {
    const newProduct = { name: 'New Case', price: 50 };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 99, ...newProduct })
    });

    const result = await productService.createProduct(newProduct, mockToken);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newProduct)
      })
    );
    expect(result.id).toBe(99);
  });

  it('should throw error if fetch fails', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500
    });

    await expect(productService.deleteProduct(1, mockToken)).rejects.toThrow(/HTTP error/);
  });
});
