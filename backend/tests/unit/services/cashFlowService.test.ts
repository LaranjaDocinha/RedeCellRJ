import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCashFlowData } from '../../../src/services/cashFlowService';
import * as dbModule from '../../../src/db/index';

const mockQuery = vi.fn();
const mockRelease = vi.fn();
const mockClient = {
  query: mockQuery,
  release: mockRelease,
};
const mockPool = {
  connect: vi.fn(() => mockClient),
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('CashFlowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCashFlowData', () => {
    it('should calculate cash flow', async () => {
      // Mock queries
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total_inflow: '1000' }] }) // Sales
        .mockResolvedValueOnce({ rows: [{ total_outflow: '200' }] }) // Expenses
        .mockResolvedValueOnce({ rows: [{ total_po_outflow: '300' }] }) // POs
        .mockResolvedValueOnce({ rows: [{ date: '2023-01-01', daily_inflow: '1000' }] }) // Daily Inflow
        .mockResolvedValueOnce({ rows: [{ date: '2023-01-01', daily_outflow: '200' }] }) // Daily Expenses
        .mockResolvedValueOnce({ rows: [{ date: '2023-01-01', daily_po_outflow: '300' }] }); // Daily POs

      const result = await getCashFlowData(1, '2023-01-01', '2023-01-31');

      expect(result.totalInflow).toBe(1000);
      expect(result.totalOutflow).toBe(500);
      expect(result.netCashFlow).toBe(500);
      expect(result.cashFlowTrend).toHaveLength(1);
      expect(result.cashFlowTrend[0]).toEqual({
        date: '2023-01-01',
        inflow: 1000,
        outflow: 500,
      });
      expect(mockRelease).toHaveBeenCalled();
    });
  });
});
