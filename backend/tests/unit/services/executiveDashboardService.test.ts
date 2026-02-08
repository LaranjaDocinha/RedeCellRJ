import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executiveDashboardService } from '../../../src/services/executiveDashboardService.js';
import pool from '../../../src/db/index.js';

const mocks = vi.hoisted(() => {
  const mQuery = vi.fn();
  const mClient = { query: mQuery, release: vi.fn() };
  const mPool = {
    connect: vi.fn().mockResolvedValue(mClient),
    query: mQuery
  };
  return { mockQuery: mQuery, mockClient: mClient, mockPool: mPool };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
}));

describe('ExecutiveDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return aggregated stats and insights', async () => {
      mocks.mockClient.query
        .mockResolvedValueOnce({ rows: [{ channel: 'Physical', count: 10, revenue: 1000 }] }) // sales
        .mockResolvedValueOnce({ rows: [{ avg_margin: 15 }] }) // margin < 20 triggers insight
        .mockResolvedValueOnce({ rows: [{ completed: 5, total: 10 }] }); // service triggers insight

      const stats = await executiveDashboardService.getStats();

      expect(stats.avgMargin).toBe('15.00');
      expect(stats.insights).toHaveLength(3);
      expect(mocks.mockClient.query).toHaveBeenCalledTimes(3);
    });
  });

  describe('generateInsights', () => {
    it('should generate high margin insight', () => {
      const insights = executiveDashboardService.generateInsights([], 45, { total: 0 });
      expect(insights.some(i => i.includes('excelente'))).toBe(true);
    });

    it('should generate low margin insight', () => {
      const insights = executiveDashboardService.generateInsights([], 15, { total: 0 });
      expect(insights.some(i => i.includes('baixa'))).toBe(true);
    });

    it('should generate high conversion insight', () => {
      const insights = executiveDashboardService.generateInsights([], 30, { completed: 8, total: 10 });
      expect(insights.some(i => i.includes('alta taxa'))).toBe(true);
    });

    it('should generate low conversion insight', () => {
      const insights = executiveDashboardService.generateInsights([], 30, { completed: 2, total: 10 });
      expect(insights.some(i => i.includes('espaço para melhorar'))).toBe(true);
    });
  });
});
