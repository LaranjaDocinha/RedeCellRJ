import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportSalesForAccounting } from '../../../src/services/accountingService';
import pool from '../../../src/db/index';
import { stringify } from 'csv-stringify/sync';

// Mock dependencies
vi.mock('../../../src/db/index', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('csv-stringify/sync', () => ({
  stringify: vi.fn(),
}));

describe('AccountingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportSalesForAccounting', () => {
    it('should query sales and return CSV string', async () => {
      const mockSales = [{ id: 1, total_amount: 100 }];
      const mockCsv = 'id,total_amount\n1,100';

      (pool.query as any).mockResolvedValue({ rows: mockSales });
      (stringify as any).mockReturnValue(mockCsv);

      const result = await exportSalesForAccounting('2023-01-01', '2023-01-31');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM sales WHERE sale_date BETWEEN $1 AND $2',
        ['2023-01-01', '2023-01-31'],
      );
      expect(stringify).toHaveBeenCalledWith(mockSales, expect.any(Object));
      expect(result).toBe(mockCsv);
    });
  });
});
