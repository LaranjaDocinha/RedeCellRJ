import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { productService } from '../../../src/services/productService.js';
import discountService from '../../../src/services/discountService.js';
import { ipWhitelistService } from '../../../src/services/ipWhitelistService.js';
import redisClient from '../../../src/utils/redisClient.js';

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

describe('Final Optimization Coverage', () => {
  let mockQuery: any;
  let mockClient: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockClient = (dbModule as any)._mockClient;
    vi.clearAllMocks();
    vi.mocked(redisClient.get).mockResolvedValue(null);
  });

  describe('ProductService Final', () => {
    it('deleteProduct should return false if not found', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        const result = await productService.deleteProduct(999);
        expect(result).toBe(false);
    });

    it('createProduct should throw error and rollback on failure', async () => {
        mockClient.query.mockResolvedValueOnce({}); // BEGIN
        mockClient.query.mockRejectedValueOnce(new Error('Fatal fail'));
        
        await expect(productService.createProduct({} as any)).rejects.toThrow('Fatal fail');
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('DiscountService Final', () => {
      it('updateDiscount with no fields should return undefined if not found', async () => {
          mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // getDiscountById inside update
          const result = await discountService.updateDiscount(1, {});
          expect(result).toBeUndefined();
      });

      it('getAllDiscounts should release client on error', async () => {
          mockClient.query.mockRejectedValueOnce(new Error('DB Error'));
          await expect(discountService.getAllDiscounts()).rejects.toThrow('DB Error');
          expect(mockClient.release).toHaveBeenCalled();
      });
  });

  describe('IpWhitelistService Final', () => {
      it('getEntryByIp should return an entry', async () => {
          mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, ip_address: '1.1.1.1' }] });
          const result = await ipWhitelistService.getEntryByIp('1.1.1.1');
          expect(result?.ip_address).toBe('1.1.1.1');
      });
  });
});
