import { describe, it, expect, vi, beforeEach } from 'vitest';
import discountService from '../../../src/services/discountService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe('DiscountService Extra Coverage', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  describe('updateDiscount (Edge Cases)', () => {
    it('should update specific fields only', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'New Name' }] });

      await discountService.updateDiscount(1, { name: 'New Name' });
      // Verify SQL contains only name update
      const call = mockClient.query.mock.calls[0];
      expect(call[0]).toContain('name = $1');
      expect(call[0]).not.toContain('value =');
    });

    it('should update multiple fields', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await discountService.updateDiscount(1, { value: 10, is_active: false });
      const call = mockClient.query.mock.calls[0];
      expect(call[0]).toContain('value = $1');
      expect(call[0]).toContain('is_active = $2');
    });

    it('should return undefined if discount to update does not exist (and logic reaches query)', async () => {
      // If we provide fields, it tries to UPDATE RETURNING *
      mockClient.query.mockResolvedValue({ rows: [] }); // No rows returned

      const result = await discountService.updateDiscount(999, { name: 'Ghost' });
      expect(result).toBeUndefined();
    });

    it('should handle database errors gracefully during delete', async () => {
      mockClient.query.mockRejectedValue(new Error('DB Error'));
      await expect(discountService.deleteDiscount(1)).rejects.toThrow('DB Error');
    });
  });

  describe('applyDiscount (Applicability Branches)', () => {
    it('should throw error if discount is expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, is_active: true, end_date: pastDate }],
      });

      await expect(discountService.applyDiscount(1, 100)).rejects.toThrow(
        'Discount not applicable',
      );
    });

    it('should throw error if max uses reached', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, is_active: true, max_uses: 5, uses_count: 5 }],
      });

      await expect(discountService.applyDiscount(1, 100)).rejects.toThrow(
        'Discount not applicable',
      );
    });

    it('should throw error if min purchase amount not met', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, is_active: true, min_purchase_amount: 200 }],
      });

      await expect(discountService.applyDiscount(1, 100)).rejects.toThrow(
        'Discount not applicable',
      );
    });

    it('should apply fixed amount discount correctly', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 1, is_active: true, type: 'fixed_amount', value: 30 }],
      });
      const result = await discountService.applyDiscount(1, 100);
      expect(result).toBe(70);
    });
  });
});
