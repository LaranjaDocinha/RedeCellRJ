import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { demandPredictionService } from '../../../src/services/demandPredictionService';
import * as dbModule from '../../../src/db/index';
import { AppError } from '../../../src/utils/errors';

// Hoisted mocks
const { mockClientQuery, mockClientConnect, mockGetPool, mockDefaultQuery } = vi.hoisted(() => {
  const query = vi.fn();
  const connect = vi.fn();
  const getPool = vi.fn(() => ({
    query: query,
    connect: connect,
    end: vi.fn(),
  }));
  const defaultQuery = vi.fn();
  return {
    mockClientQuery: query,
    mockClientConnect: connect,
    mockGetPool: getPool,
    mockDefaultQuery: defaultQuery,
  };
});

vi.mock('../../../src/db/index', async (importActual) => {
  const actual = await importActual<typeof dbModule>();
  return {
    ...actual,
    getPool: mockGetPool,
    default: {
      query: mockDefaultQuery,
      connect: mockClientConnect,
      getPool: mockGetPool,
    },
  };
});

describe('DemandPredictionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('predictDemand', () => {
    it('should predict demand based on average sales', async () => {
      // 3 months, total 30 sold => 10 per month
      mockDefaultQuery.mockResolvedValueOnce({ rows: [{ total_quantity_sold: '30' }] });

      const result = await demandPredictionService.predictDemand('prod1', 3);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining(['prod1'])
      );
      expect(result).toBe(10);
    });

    it('should default to 3 months if not specified', async () => {
      mockDefaultQuery.mockResolvedValueOnce({ rows: [{ total_quantity_sold: '30' }] });

      const result = await demandPredictionService.predictDemand('prod1');

      expect(result).toBe(10);
    });

    it('should throw AppError if productId is missing', async () => {
      await expect(demandPredictionService.predictDemand('')).rejects.toThrow(AppError);
    });
  });
});
