import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiInventoryService } from '../../../src/services/aiInventoryService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn() },
}));

describe('AiInventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPredictiveInsights', () => {
    it('should return insights for low stock items', async () => {
      const mockRows = [
        { 
          name: 'iPhone 13', 
          color: 'Blue', 
          storage_capacity: '128GB', 
          stock_quantity: 2, 
          daily_burn_rate: '1.0' // 2 days remaining
        },
        { 
          name: 'Charger', 
          color: 'White', 
          stock_quantity: 5, 
          daily_burn_rate: '1.0' // 5 days remaining
        }
      ];
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockRows } as any);

      const insights = await aiInventoryService.getPredictiveInsights(1);

      expect(insights).toHaveLength(2);
      expect(insights[0].priority).toBe('high'); // < 3 days
      expect(insights[1].priority).toBe('medium'); // < 7 days
    });

    it('should filter out items with plenty of stock', async () => {
      const mockRows = [
        { 
          name: 'Cable', 
          color: 'Black', 
          stock_quantity: 100, 
          daily_burn_rate: '1.0' // 100 days remaining
        }
      ];
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockRows } as any);

      const insights = await aiInventoryService.getPredictiveInsights(1);
      expect(insights).toHaveLength(0); // Should filter out if > 15 days
    });

    it('should handle zero burn rate', async () => {
      const mockRows = [
        { 
          name: 'Old Case', 
          color: 'Red', 
          stock_quantity: 1, 
          daily_burn_rate: '0.0' // 999 days remaining
        }
      ];
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockRows } as any);

      const insights = await aiInventoryService.getPredictiveInsights(1);
      expect(insights).toHaveLength(0);
    });
  });
});
