import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateBreakEvenPoint } from '../../../src/services/breakEvenService';
import * as dbModule from '../../../src/db/index';

// Mock getPool and client
const mockClient = {
  query: vi.fn(),
  release: vi.fn(),
};

const mockPool = {
  connect: vi.fn(() => mockClient),
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('BreakEvenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateBreakEvenPoint', () => {
    it('should calculate metrics correctly', async () => {
      // Mock Fixed Costs Query
      mockClient.query.mockResolvedValueOnce({
        rows: [{ total_fixed_expenses: '1000' }], // + 5000 dummy = 6000
      });

      // Mock Sales Data Query
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            total_revenue: '20000',
            total_variable_costs: '10000',
            total_units_sold: '100',
          },
        ],
      });

      const result = await calculateBreakEvenPoint(1, '2023-01-01', '2023-01-31');

      // Assertions based on logic:
      // Fixed Costs: 1000 + 5000 = 6000
      // Revenue: 20000
      // Variable: 10000
      // Units: 100
      // Avg Price: 20000 / 100 = 200
      // Avg Var Cost: 10000 / 100 = 100
      // CM per Unit: 200 - 100 = 100
      // BE Units: 6000 / 100 = 60
      // CM Ratio: (20000 - 10000) / 20000 = 0.5
      // BE Revenue: 6000 / 0.5 = 12000

      expect(result.totalFixedCosts).toBe(6000);
      expect(result.averageSellingPrice).toBe(200);
      expect(result.breakEvenUnits).toBe(60);
      expect(result.breakEvenRevenue).toBe(12000);

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle zero units sold (avoid division by zero)', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ total_fixed_expenses: '0' }] });
      mockClient.query.mockResolvedValueOnce({ rows: [{ total_units_sold: '0' }] });

      const result = await calculateBreakEvenPoint(undefined, '2023-01-01', '2023-01-31');

      expect(result.averageSellingPrice).toBe(0);
      expect(result.breakEvenUnits).toBe(0);
    });
  });
});
