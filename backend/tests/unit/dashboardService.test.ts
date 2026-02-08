import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from '../../src/services/dashboardService.js';
import { dashboardRepository } from '../../src/repositories/dashboard.repository.js';
import redisClient from '../../src/utils/redisClient.js';

vi.mock('../../src/repositories/dashboard.repository.js', () => ({
  dashboardRepository: {
    getTotalSales: vi.fn(),
    getSalesByMonth: vi.fn(),
  },
}));

describe('DashboardService Unit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch total sales amount', async () => {
    vi.mocked(redisClient.get).mockResolvedValue(null);
    vi.mocked(dashboardRepository.getTotalSales).mockResolvedValue({ total_amount: 500 });

    const res = await dashboardService.getTotalSalesAmount();
    expect(res.mainPeriodSales.total_amount).toBe(500);
  });
});
