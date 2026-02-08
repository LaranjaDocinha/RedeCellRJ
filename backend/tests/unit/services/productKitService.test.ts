import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPool, mockPoolQuery, mockConnect, mockClient, mockClientQuery } = vi.hoisted(() => {
  const mPoolQuery = vi.fn();
  const mClientQuery = vi.fn();
  const mRelease = vi.fn();
  const mClient = { query: mClientQuery, release: mRelease };
  const mConnect = vi.fn().mockResolvedValue(mClient);
  const mPool = { query: mPoolQuery, connect: mConnect };
  return {
    mockPool: mPool,
    mockPoolQuery: mPoolQuery,
    mockConnect: mConnect,
    mockClient: mClient,
    mockClientQuery: mClientQuery,
  };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mockPool,
  getPool: () => mockPool,
  query: mockPoolQuery,
  connect: mockConnect,
}));

vi.mock('../../../src/services/inventoryService.js', () => ({
  inventoryService: {
    adjustStock: vi.fn().mockResolvedValue({}),
  },
}));

import { productKitService } from '../../../src/services/productKitService.js';
import { AppError } from '../../../src/utils/errors.js';
import { inventoryService } from '../../../src/services/inventoryService.js';

describe('ProductKitService', () => {
  const mockKit = { id: 1, name: 'Combo 1', price: 100, is_active: true };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPoolQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockConnect.mockResolvedValue(mockClient);
  });

  describe('getAllProductKits', () => {
    it('should return all kits from db', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [mockKit] });
      const result = await productKitService.getAllProductKits();
      expect(result).toEqual([mockKit]);
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT pk.*'));
    });
  });

  describe('getProductKitById', () => {
    it('should return kit with items', async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ variation_id: 10, quantity: 2 }], rowCount: 1 });

      const result = await productKitService.getProductKitById(1);
      expect(result?.name).toBe('Combo 1');
      expect(result?.items).toHaveLength(1);
    });

    it('should return undefined if kit not found', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const result = await productKitService.getProductKitById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('createProductKit', () => {
    it('should create kit and its items in transaction', async () => {
      mockClientQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [mockKit] }) // INSERT pk
        .mockResolvedValueOnce({}) // INSERT pki
        .mockResolvedValueOnce({}); // COMMIT

      const result = await productKitService.createProductKit({
        name: 'New Kit',
        price: 50,
        items: [{ product_id: 1, variation_id: 1, quantity: 1 }]
      });

      expect(result.id).toBe(1);
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      mockClientQuery.mockResolvedValueOnce({}); // BEGIN
      mockClientQuery.mockRejectedValueOnce(new Error('Fail'));

      await expect(productKitService.createProductKit({ name: 'E', price: 0, items: [] })).rejects.toThrow();
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('updateProductKit', () => {
    it('should update kit fields and replace items', async () => {
      mockClientQuery.mockResolvedValueOnce({}); // BEGIN
      // UPDATE pk
      mockClientQuery.mockResolvedValueOnce({ rows: [mockKit] });
      // DELETE items
      mockClientQuery.mockResolvedValueOnce({});
      // INSERT new items
      mockClientQuery.mockResolvedValueOnce({});
      // COMMIT
      mockClientQuery.mockResolvedValueOnce({});

      // Mock getProductKitById called at end
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await productKitService.updateProductKit(1, { name: 'Updated', items: [] });

      expect(mockClientQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE product_kits'), expect.any(Array));
      expect(mockClientQuery).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM product_kit_items'), [1]);
    });
  });

  describe('deleteProductKit', () => {
    it('should delete kit and items', async () => {
      mockClientQuery.mockResolvedValueOnce({}); // BEGIN
      mockClientQuery.mockResolvedValueOnce({}); // DELETE items
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 }); // DELETE pk
      mockClientQuery.mockResolvedValueOnce({}); // COMMIT

      const result = await productKitService.deleteProductKit(1);
      expect(result).toBe(true);
    });
  });

  describe('kitProducts', () => {
    it('should kit products successfully', async () => {
      // Mock getProductKitById internal call
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 }) // kit
        .mockResolvedValueOnce({ rows: [{ variation_id: 1, quantity: 2 }], rowCount: 1 }); // items

      let callCount = 0;
      mockClientQuery.mockImplementation(async (query: string) => {
        callCount++;
        if (query.includes('BEGIN')) return { rows: [], rowCount: 0 };
        if (query.includes('SELECT stock_quantity')) return { rows: [{ stock_quantity: 10 }], rowCount: 1 };
        if (query.includes('UPDATE product_variations')) return { rows: [], rowCount: 1 };
        if (query.includes('COMMIT')) return { rows: [], rowCount: 0 };
        return { rows: [], rowCount: 0 };
      });

      const result = await productKitService.kitProducts(1, 2, 'user1', 1);
      expect(result.message).toContain('successfully');
      expect(inventoryService.adjustStock).toHaveBeenCalledWith(1, -4, 'kitting', 'user1', mockClient);
    });

    it('should throw 404 if kit not found', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      await expect(productKitService.kitProducts(999, 1, 'u', 1)).rejects.toThrow('Product kit not found');
    });

    it('should throw 400 if kit has no items', async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });
      await expect(productKitService.kitProducts(1, 1, 'u', 1)).rejects.toThrow('no items defined');
    });

    it('should throw 400 if insufficient stock', async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ variation_id: 1, quantity: 5 }], rowCount: 1 });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ stock_quantity: 2 }], rowCount: 1 }); // stock 2 < 5

      await expect(productKitService.kitProducts(1, 1, 'u', 1)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('dekitProducts', () => {
    it('should de-kit successfully', async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ variation_id: 1, quantity: 1 }], rowCount: 1 });
      
      mockClientQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // update stock
        .mockResolvedValueOnce({}); // COMMIT

      const result = await productKitService.dekitProducts(1, 5, 'user1', 1);
      expect(result.message).toContain('de-kitted');
      expect(inventoryService.adjustStock).toHaveBeenCalledWith(1, 5, 'de-kitting', 'user1', mockClient);
    });
  });
});
