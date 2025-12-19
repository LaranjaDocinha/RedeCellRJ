import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateRfmScores } from '../../../src/services/crmService';
import * as dbModule from '../../../src/db/index';

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

describe('CrmService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculateRfmScores', () => {
    it('should execute RFM query', async () => {
      const mockResult = [{ name: 'John', email: 'john@example.com', r_score: 5, f_score: 5, m_score: 5 }];
      mockDefaultQuery.mockResolvedValueOnce({ rows: mockResult });

      const result = await calculateRfmScores();

      const expectedQuery = `
    WITH customer_kpis AS (
      SELECT
        customer_id,
        MAX(sale_date) as last_purchase_date,
        COUNT(id) as frequency,
        SUM(total_amount) as monetary
      FROM sales
      GROUP BY customer_id
    ),
    rfm_scores AS (
      SELECT
        customer_id,
        NTILE(5) OVER (ORDER BY last_purchase_date DESC) as r_score, -- Recency
        NTILE(5) OVER (ORDER BY frequency ASC) as f_score,      -- Frequency
        NTILE(5) OVER (ORDER BY monetary ASC) as m_score       -- Monetary
      FROM customer_kpis
    )
    SELECT c.name, c.email, r.r_score, r.f_score, r.m_score FROM rfm_scores r
    JOIN customers c ON r.customer_id = c.id
    ORDER BY (r.r_score + r.f_score + r.m_score) DESC;
  `;

      const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').trim();

      expect(mockDefaultQuery).toHaveBeenCalledTimes(1);
      const actualQuery = mockDefaultQuery.mock.calls[0][0];
      expect(normalizeSql(actualQuery)).toBe(normalizeSql(expectedQuery));
      expect(result).toEqual(mockResult);
    });
  });
});
