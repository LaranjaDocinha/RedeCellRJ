import { describe, it, expect, vi, beforeEach } from 'vitest';
import { repairAnalyticsService } from '../../../src/services/repairAnalyticsService.js';
import pool from '../../../src/db/index.js';

const mocks = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
  };
  return { mockClient, mockPool };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
}));

describe('RepairAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRepairTrends', () => {
    it('should return trends and detect spikes', async () => {
      const mockRows = [
        { model: 'iPhone 13', frequency: 15, avg_cost: 200 },
        { model: 'iPhone 12', frequency: 5, avg_cost: 150 }
      ];
      mocks.mockClient.query.mockResolvedValueOnce({ rows: mockRows } as any);

      const result = await repairAnalyticsService.getRepairTrends();

      expect(result).toHaveLength(2);
      expect(result[0].spikeDetected).toBe(true);
      expect(result[0].recommendation).toContain('Reforce o estoque');
      expect(result[1].spikeDetected).toBe(false);
      expect(result[1].recommendation).toBe('Normal');
    });
  });
});
