import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cycleCountService } from '../../../src/services/cycleCountService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe('CycleCountService', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  describe('createCycleCount', () => {
    it('should create cycle count and items', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT cycle_count
        .mockResolvedValueOnce({ rows: [{ stock_quantity: 10 }] }) // SELECT current stock
        .mockResolvedValueOnce({}); // INSERT cycle_count_item

      const payload = {
        counted_by_user_id: 1,
        branch_id: 1,
        items: [{ product_variation_id: 101, counted_quantity: 12 }]
      };

      const result = await cycleCountService.createCycleCount(payload);

      expect(result.id).toBe(1);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO cycle_count_items'), expect.arrayContaining([1, 101, 12, 10, 2, undefined]));
    });

    it('should rollback on error during creation', async () => {
        mockClient.query.mockResolvedValueOnce({}); // BEGIN
        mockClient.query.mockRejectedValueOnce(new Error('Fail'));

        await expect(cycleCountService.createCycleCount({ items: [] } as any)).rejects.toThrow('Fail');
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getCycleCountById', () => {
      it('should return cycle count with items', async () => {
          (pool.query as any)
            .mockResolvedValueOnce({ rows: [{ id: 1 }] })
            .mockResolvedValueOnce({ rows: [{ id: 10 }] });
          
          const result = await cycleCountService.getCycleCountById(1);
          expect(result.id).toBe(1);
          expect(result.items).toHaveLength(1);
      });

      it('should return null if not found', async () => {
        (pool.query as any).mockResolvedValueOnce({ rows: [] });
        const result = await cycleCountService.getCycleCountById(999);
        expect(result).toBeNull();
    });
  });

  describe('updateCycleCount', () => {
    it('should update status and notes', async () => {
      mockClient.query.mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // UPDATE
      
      // Mock getCycleCountById (via pool.query directly in that method)
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1, items: [] }] });

      const result = await cycleCountService.updateCycleCount(1, { status: 'in_progress', notes: 'New' });
      expect(result.id).toBe(1);
    });

    it('should adjust stock when status is completed', async () => {
        mockClient.query.mockResolvedValueOnce({}); // BEGIN
        mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // UPDATE cycle_counts

        // Mock getCycleCountById for internal calls (pool.query)
        (pool.query as any)
            // Call inside 'if (status === "completed")'
            .mockResolvedValueOnce({ rows: [{ id: 1, status: 'completed' }] }) // countResult
            .mockResolvedValueOnce({ rows: [{ product_variation_id: 101, discrepancy: -2 }] }) // itemsResult
            // Call at the end for return
            .mockResolvedValueOnce({ rows: [{ id: 1, status: 'completed' }] }) // countResult
            .mockResolvedValueOnce({ rows: [{ product_variation_id: 101, discrepancy: -2 }] }); // itemsResult

        await cycleCountService.updateCycleCount(1, { status: 'completed' });

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE product_variations SET stock_quantity = stock_quantity + $1'),
            [-2, 101]
        );
    });
  });

  describe('deleteCycleCount', () => {
      it('should delete in a transaction', async () => {
          mockClient.query.mockResolvedValueOnce({}); // BEGIN
          mockClient.query.mockResolvedValueOnce({}); // DELETE items
          (pool.query as any).mockResolvedValueOnce({ rowCount: 1 }); // DELETE count
          mockClient.query.mockResolvedValueOnce({}); // COMMIT

          const result = await cycleCountService.deleteCycleCount(1);
          expect(result).toBe(true);
      });
  });
});