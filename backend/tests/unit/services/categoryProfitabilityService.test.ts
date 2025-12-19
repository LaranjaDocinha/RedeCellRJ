import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCategoryProfitability } from '../../../src/services/categoryProfitabilityService';
import * as dbModule from '../../../src/db/index';

// Hoisted mocks
const { mockClientQuery, mockClientRelease, mockClientConnect, mockGetPool } = vi.hoisted(() => {
  const query = vi.fn();
  const release = vi.fn();
  const connect = vi.fn(() => ({
    query,
    release,
  }));
  const getPool = vi.fn(() => ({
    connect,
    query, // Adicionado caso seja usado diretamente, embora connect seja o foco aqui
    end: vi.fn(),
  }));
  return {
    mockClientQuery: query,
    mockClientRelease: release,
    mockClientConnect: connect,
    mockGetPool: getPool,
  };
});

vi.mock('../../../src/db/index', async (importActual) => {
  const actual = await importActual<typeof dbModule>();
  return {
    ...actual,
    getPool: mockGetPool,
  };
});

describe('CategoryProfitabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return category profitability report without branch filter', async () => {
    const mockRows = [
      {
        category_id: 1,
        category_name: 'Electronics',
        total_revenue: '1000',
        total_cost: '600',
        total_profit: '400',
      },
    ];
    mockClientQuery.mockResolvedValueOnce({ rows: mockRows });

    const startDate = '2023-01-01';
    const endDate = '2023-01-31';
    const result = await getCategoryProfitability(undefined, startDate, endDate);

    expect(mockGetPool).toHaveBeenCalled();
    expect(mockClientConnect).toHaveBeenCalled();
    expect(mockClientQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [startDate, endDate]
    );
    expect(mockClientRelease).toHaveBeenCalled();
    
    expect(result).toEqual([
      {
        category_id: 1,
        category_name: 'Electronics',
        total_revenue: '1000.00',
        total_cost: '600.00',
        total_profit: '400.00',
        profit_margin: '40.00',
      },
    ]);
  });

  it('should return category profitability report with branch filter', async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [] });

    const branchId = 5;
    await getCategoryProfitability(branchId, '2023-01-01', '2023-01-31');

    expect(mockClientQuery).toHaveBeenCalledWith(
      expect.stringContaining('AND s.branch_id = $3'),
      ['2023-01-01', '2023-01-31', '5']
    );
  });

  it('should handle division by zero or empty values gracefully', async () => {
    const mockRows = [
      {
        category_id: 2,
        category_name: 'Empty',
        total_revenue: null,
        total_cost: null,
        total_profit: null,
      },
    ];
    mockClientQuery.mockResolvedValueOnce({ rows: mockRows });

    const result = await getCategoryProfitability(undefined, '2023-01-01', '2023-01-31');

    expect(result).toEqual([
      {
        category_id: 2,
        category_name: 'Empty',
        total_revenue: '0.00',
        total_cost: '0.00',
        total_profit: '0.00',
        profit_margin: '0.00', // 0 / 1 * 100
      },
    ]);
  });

  it('should release client even if query fails', async () => {
    mockClientQuery.mockRejectedValueOnce(new Error('DB Error'));

    await expect(getCategoryProfitability(undefined, '2023-01-01', '2023-01-31'))
      .rejects.toThrow('DB Error');
    
    expect(mockClientRelease).toHaveBeenCalled();
  });
});
