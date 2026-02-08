import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as reportDataService from '../../../src/services/reportDataService.js';
import pool from '../../../src/db/index.js';

const { mockPoolInstance, mockQuery } = vi.hoisted(() => {
  const mQuery = vi.fn();
  return {
    mockQuery: mQuery,
    mockPoolInstance: { query: mQuery },
  };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mockPoolInstance,
  getPool: () => mockPoolInstance,
}));

describe('ReportDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('getContributionMarginByCategory', () => {
    it('should return categories with margins', async () => {
      const mockRows = [{ category_name: 'A', contribution_margin: 100 }];
      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const result = await reportDataService.getContributionMarginByCategory();
      expect(result).toEqual(mockRows);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SUM((si.unit_price - si.cost_price)'));
    });
  });

  describe('getBreakEvenPoint', () => {
    it('should calculate break-even point correctly', async () => {
      // 1. Sales data
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ total_revenue: '10000', total_variable_costs: '6000' }] 
      });
      // 2. Fixed costs
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ value: '2000' }] 
      });

      const result = await reportDataService.getBreakEvenPoint();

      expect(result.totalRevenue).toBe(10000);
      expect(result.fixedCosts).toBe(2000);
      expect(result.breakEvenPoint).toBe(5000);
      expect(result.currentProfit).toBe(2000);
    });

    it('should handle zero revenue', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No sales
      mockQuery.mockResolvedValueOnce({ rows: [{ value: '5000' }] }); // Fixed costs

      const result = await reportDataService.getBreakEvenPoint();
      expect(result.breakEvenPoint).toBe(0);
      expect(result.currentProfit).toBe(-5000);
    });
  });

  describe('getCustomerLTV', () => {
    it('should return customers with LTV', async () => {
      const mockRows = [{ customer_id: 1, lifetime_value: 500 }];
      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const result = await reportDataService.getCustomerLTV();
      expect(result).toEqual(mockRows);
    });
  });

  describe('getCustomerAcquisitionCost', () => {
    it('should calculate CAC correctly', async () => {
      // 1. New customers
      mockQuery.mockResolvedValueOnce({ rows: [{ new_customers_count: '10' }] });
      // 2. Marketing spend
      mockQuery.mockResolvedValueOnce({ rows: [{ total_marketing_spend: '1000' }] });

      const result = await reportDataService.getCustomerAcquisitionCost();
      expect(result.cac).toBe(100);
      expect(result.newCustomersCount).toBe(10);
    });

    it('should return 0 CAC if no new customers', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ new_customers_count: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ total_marketing_spend: '1000' }] });

      const result = await reportDataService.getCustomerAcquisitionCost();
      expect(result.cac).toBe(0);
    });
  });
});
