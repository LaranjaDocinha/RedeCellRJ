import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as financeService from '../../../src/services/financeService.js';
import pool from '../../../src/db/index.js';

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: mockQuery,
  },
}));

describe('FinanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('getDRE', () => {
    it('should return a full DRE report', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total_revenue: '1000.00' }] } as any) // Revenue
        .mockResolvedValueOnce({ rows: [{ total_cogs: '400.00' }] } as any) // COGS
        .mockResolvedValueOnce({ rows: [{ total_expenses: '200.00' }] } as any); // Expenses

      const res = await financeService.getDRE('2023-01-01', '2023-01-31');

      expect(res.grossRevenue).toBe(1000);
      expect(res.grossProfit).toBe(540);
      expect(res.netProfit).toBe(310);
      expect(res.margin).toBe(31); // 310/1000 * 100
    });

    it('should handle zero revenue in DRE', async () => {
      mockQuery.mockResolvedValue({ rows: [{ total_revenue: '0', total_cogs: '0', total_expenses: '0' }] } as any);
      const res = await financeService.getDRE('2023-01-01', '2023-01-31');
      expect(res.margin).toBe(0);
    });
  });

  describe('getCashFlowReport', () => {
    it('should return aggregated cash flow data', async () => {
      const mockRows = [{ date: '2023-01-01', total_income: 100, total_expense: 50 }];
      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const result = await financeService.getCashFlowReport('2023-01-01', '2023-01-31');
      expect(result).toEqual(mockRows);
    });
  });

  describe('getProductProfitabilityReport', () => {
    it('should return product profitability with parsed numbers', async () => {
      const mockRows = [{
        product_name: 'P1',
        total_quantity_sold: '10',
        total_revenue: '1000.00',
        total_cost_of_goods_sold: '600.00',
        gross_profit: '400.00',
        gross_margin_percentage: '40.0'
      }];
      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const result = await financeService.getProductProfitabilityReport('2023-01-01', '2023-01-31');

      expect(result[0].total_quantity_sold).toBe(10);
      expect(result[0].total_revenue).toBe(1000);
      expect(result[0].gross_margin_percentage).toBe(40);
    });
  });
});
