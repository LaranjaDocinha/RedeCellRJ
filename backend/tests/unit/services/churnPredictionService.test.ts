import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    connect: mockConnect,
    query: mockQuery,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

import * as churnPredictionService from '../../../src/services/churnPredictionService.js';

describe('churnPredictionService', () => {
  let mockQuery: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getChurnRisk', () => {
    it('should return null if customer not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const result = await churnPredictionService.getChurnRisk(1);
      expect(result).toBeNull();
    });

    it('should return high risk if customer has no purchase history', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'Test', email: 't@t.com' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No last sale
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 });
      
      const result = await churnPredictionService.getChurnRisk(1);
      expect(result?.riskScore).toBe(50);
      expect(result?.status).toBe('medium');
    });

    it('should return high risk for inactivity (last purchase > 60 days)', async () => {
      const date = new Date(Date.now() - 65 * 86400000);
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'Test', email: 't@t.com' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ last_sale: date }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 });

      const result = await churnPredictionService.getChurnRisk(1);
      expect(result?.riskScore).toBe(40);
    });
    
    it('should return low risk for regular activity', async () => {
      const date = new Date();
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'Test', email: 't@t.com' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ last_sale: date }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 });

      const result = await churnPredictionService.getChurnRisk(1);
      expect(result?.riskScore).toBe(0);
    });
  });

  describe('getCustomersWithHighChurnRisk', () => {
    it('should return customers with medium/high churn risk', async () => {
      // 1. Query inicial: lista de candidatos
      mockQuery.mockResolvedValueOnce({ 
        rows: [
          { id: 1, name: 'High Risk' },
          { id: 2, name: 'No History (Medium)' },
          { id: 3, name: 'Low Risk' },
        ],
        rowCount: 3 
      });

      // --- Cliente 1 (High Risk: Inactive + Low Vol) ---
      // getChurnRisk(1):
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'High Risk', email: 'h@h.com' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ last_sale: new Date(Date.now() - 70 * 86400000) }], rowCount: 1 }); // > 60 days (+40)
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 }); // < 2 purchases (+30)
      // Total Score: 70 -> High

      // --- Cliente 2 (Medium Risk: No History) ---
      // getChurnRisk(2):
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'No History', email: 'n@n.com' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No last sale (+50)
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 });
      // Total Score: 50 -> Medium

      // --- Cliente 3 (Low Risk) ---
      // getChurnRisk(3):
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'Low Risk', email: 'l@l.com' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ last_sale: new Date() }], rowCount: 1 }); // Recent
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 }); // Frequent
      // Total Score: 0 -> Low

      const result = await churnPredictionService.getCustomersWithHighChurnRisk();
      
      // Esperamos que 1 e 2 sejam retornados, pois score > 40
      expect(result).toHaveLength(2);
      expect(result.map(r => r.customerId)).toEqual([1, 2]);
    });

    it('should return empty array if no customers found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const result = await churnPredictionService.getCustomersWithHighChurnRisk();
      expect(result).toHaveLength(0);
    });
  });
});
