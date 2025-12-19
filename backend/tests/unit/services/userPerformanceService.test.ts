import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPerformanceData } from '../../../src/services/userPerformanceService.js';
import { getPool } from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

describe('UserPerformanceService', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPool as any).mockReturnValue({ connect: vi.fn().mockResolvedValue(mockClient) });
  });

  it('should return aggregated performance data', async () => {
    // Sequence of queries: Sales, Repairs, Goals, Badges
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ total_sales: '1000', num_sales: '5' }] }) // Sales
      .mockResolvedValueOnce({ rows: [{ num_repairs: '3' }] }) // Repairs
      .mockResolvedValueOnce({ rows: [{ name: 'Goal 1' }] }) // Goals
      .mockResolvedValueOnce({ rows: [{ name: 'Badge 1' }] }); // Badges

    const result = await getPerformanceData('user1', '2023-01-01', '2023-01-31');

    expect(result).toEqual({
      totalSales: 1000,
      numSales: 5,
      numRepairs: 3,
      goals: [{ name: 'Goal 1' }],
      badges: [{ name: 'Badge 1' }],
      commissions: expect.any(Array), // Placeholder check
    });

    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should handle missing data gracefully', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [{}] }) // Sales (nulls)
      .mockResolvedValueOnce({ rows: [{}] }) // Repairs (nulls)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await getPerformanceData('user1', '2023-01-01', '2023-01-31');

    expect(result.totalSales).toBe(0);
    expect(result.numSales).toBe(0);
    expect(result.numRepairs).toBe(0);
  });
});
