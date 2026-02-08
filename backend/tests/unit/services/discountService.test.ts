import { describe, it, expect, vi, beforeEach } from 'vitest';
import discountService from '../../../src/services/discountService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe('DiscountService', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  describe('getClient', () => {
    it('should connect to pool if no client is provided', async () => {
      // Access private method using any casting
      const client = await (discountService as any).getClient();
      expect(pool.connect).toHaveBeenCalled();
      expect(client).toBe(mockClient);
    });

    it('should use provided client if available', async () => {
      const providedClient = { query: vi.fn() } as any;
      const client = await (discountService as any).getClient(providedClient);
      expect(pool.connect).not.toHaveBeenCalled();
      expect(client).toBe(providedClient);
    });
  });

  describe('getAllDiscounts', () => {
    it('should return all discounts', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'D1' }] });
      const result = await discountService.getAllDiscounts();
      expect(result).toHaveLength(1);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('createDiscount', () => {
    it('should create a discount', async () => {
      const payload = {
        name: 'New',
        type: 'percentage' as const,
        value: 0.1,
        start_date: '2023-01-01',
      };
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, ...payload }] });
      const result = await discountService.createDiscount(payload);
      expect(result.id).toBe(1);
    });

    it('should throw AppError on unique violation', async () => {
      const error = new Error('Duplicate');
      (error as any).code = '23505';
      mockClient.query.mockRejectedValue(error);
      await expect(discountService.createDiscount({} as any)).rejects.toThrow(
        'Discount with this name already exists',
      );
    });
  });

  describe('updateDiscount', () => {
    it('should update discount fields', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'Updated' }] });
      const result = await discountService.updateDiscount(1, { name: 'Updated' });
      expect(result?.name).toBe('Updated');
    });

    it('should return existing discount if no fields to update', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'Old' }] });
      const result = await discountService.updateDiscount(1, {});
      expect(result?.name).toBe('Old');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM discounts'),
        [1],
      );
    });
  });

  describe('findBestDiscount', () => {
    it('should find best discount based on savings', async () => {
      mockClient.query.mockResolvedValue({
        rows: [
          { id: 1, type: 'percentage', value: 0.1 }, // 10% of 100 = 10
          { id: 2, type: 'fixed_amount', value: 15 }, // 15
        ],
      });
      const result = await discountService.findBestDiscount(100);
      expect(result?.discount.id).toBe(2);
      expect(result?.savings).toBe(15);
      expect(result?.finalAmount).toBe(85);
    });

    it('should return null if no discounts match', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });
      const result = await discountService.findBestDiscount(100);
      expect(result).toBeNull();
    });
  });

  describe('applyDiscount', () => {
    it('should apply valid percentage discount', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 1, is_active: true, type: 'percentage', value: 0.2 }],
      });
      const result = await discountService.applyDiscount(1, 100);
      expect(result).toBe(80);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE discounts SET uses_count'),
        [1],
      );
    });

    it('should throw error if discount is not applicable', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1, is_active: false }] });
      await expect(discountService.applyDiscount(1, 100)).rejects.toThrow(
        'Discount not applicable',
      );
    });
  });
});
