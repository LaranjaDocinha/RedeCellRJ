import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCashFlowData } from '../../../src/services/cashFlowService.js';
import { cashFlowRepository } from '../../../src/repositories/cashFlow.repository.js';

vi.mock('../../../src/repositories/cashFlow.repository.js', () => ({
  cashFlowRepository: {
    getSummary: vi.fn(),
    getDailyBreakdown: vi.fn(),
  },
}));

describe('CashFlowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCashFlowData', () => {
    it('should calculate cash flow correctly', async () => {
      vi.mocked(cashFlowRepository.getSummary).mockResolvedValue({
        totalInflow: 1000,
        totalOutflow: 500,
        netCashFlow: 500,
      });
      vi.mocked(cashFlowRepository.getDailyBreakdown).mockResolvedValue({
        inflows: [{ date: '2023-01-01', amount: 1000 }],
        expenses: [{ date: '2023-01-01', amount: 300 }],
        purchases: [{ date: '2023-01-01', amount: 200 }],
      });

      const result = await getCashFlowData(1, '2023-01-01', '2023-01-31');

      expect(result.totalInflow).toBe(1000);
      expect(result.totalOutflow).toBe(500);
      expect(result.netCashFlow).toBe(500);
      expect(result.cashFlowTrend[0]).toEqual({
        date: '2023-01-01',
        inflow: 1000,
        outflow: 500,
      });
    });
  });
});
