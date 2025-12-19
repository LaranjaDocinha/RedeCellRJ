import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cycleCountService } from '../../../src/services/cycleCountService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe('CycleCountService Extra Coverage', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  describe('updateCycleCount (Extra)', () => {
    it('should update cycle count items (delete and re-insert)', async () => {
        // Mocks for client.query (transactional)
        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            // UPDATE cycle_counts skipped because no fields to update
            .mockResolvedValueOnce({}) // DELETE old items
            .mockResolvedValueOnce({ rows: [{ stock_quantity: 50 }] }) // SELECT stock for item 101
            .mockResolvedValueOnce({}) // INSERT new item
            .mockResolvedValueOnce({}); // COMMIT

        // Mocks for pool.query (getCycleCountById called at end)
        (pool.query as any)
            .mockResolvedValueOnce({ rows: [{ id: 1, status: 'in_progress' }] }) // count
            .mockResolvedValueOnce({ rows: [] }); // items

        const items = [{ product_variation_id: 101, counted_quantity: 48 }];
        await cycleCountService.updateCycleCount(1, { items });

        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM cycle_count_items'), [1]);
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO cycle_count_items'), expect.any(Array));
    });

    it('should handle errors during update and rollback', async () => {
        // Reset mocks specifically for this test
        mockClient.query.mockReset();
        mockClient.release.mockReset();
        
        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockRejectedValueOnce(new Error('Update failed')); // UPDATE fails

        await expect(cycleCountService.updateCycleCount(1, { notes: 'fail' }))
            .rejects.toThrow('Update failed');
        
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
    
    it('should delete cycle count and handle errors', async () => {
        mockClient.query.mockReset();
        
        mockClient.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockRejectedValueOnce(new Error('Delete failed')); // DELETE items fails

        await expect(cycleCountService.deleteCycleCount(1)).rejects.toThrow('Delete failed');
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
