import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commissionService } from '../../../src/services/commissionService.js';
import pool from '../../../src/db/index.js';

const { mockPool, mockQuery } = vi.hoisted(() => {
  const mQuery = vi.fn();
  const mClient = {
    query: mQuery,
    release: vi.fn(),
  };
  const mPool = {
    connect: vi.fn().mockResolvedValue(mClient),
    query: mQuery,
  };
  return { mockPool: mPool, mockQuery: mQuery };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mockPool,
  getPool: () => mockPool,
}));

describe('CommissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('calculateForSale', () => {
    const mockSale = {
      id: 1,
      user_id: 'user1',
      items: [{ category_id: 5, total_price: 100 }]
    };

    it('should calculate and insert commission when rule exists', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ role_id: 2 }] }) // user_roles query
        .mockResolvedValueOnce({ rows: [{ percentage: 10, fixed_value: 5 }] }) // rule query
        .mockResolvedValueOnce({}); // INSERT query

      await commissionService.calculateForSale(mockSale);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO commissions_earned'),
        ['user1', 1, 100, 15] // 100 * 0.1 + 5 = 15
      );
    });

    it('should do nothing if no rule found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // no role
        .mockResolvedValueOnce({ rows: [] }); // no rule

      await commissionService.calculateForSale(mockSale);
      expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO commissions_earned'), expect.any(Array));
    });
  });

  describe('calculateForOS', () => {
    const mockOS = { id: 10, technician_id: 'tech1', budget_value: 200 };

    it('should calculate commission for OS technician', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ percentage: 5, fixed_value: 0 }] }) // rule query
        .mockResolvedValueOnce({}); // INSERT query

      await commissionService.calculateForOS(mockOS);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO commissions_earned'),
        ['tech1', 10, 200, 10] // 200 * 0.05 = 10
      );
    });

    it('should skip if no technician_id', async () => {
      await commissionService.calculateForOS({ id: 11 });
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe('getSalespersonPerformance', () => {
    it('should calculate commission totals correctly', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_sales: '300.00', total_commission: '30.00' }],
        rowCount: 1,
      } as any);

      const result = await commissionService.getSalespersonPerformance(
        'user1',
        '2023-01-01',
        '2023-01-31',
      );

      expect(result.totals.totalSales).toBe(300);
      expect(result.totals.totalCommission).toBe(30);
    });
  });
});
