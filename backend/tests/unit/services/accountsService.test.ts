import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPool, mockQuery } = vi.hoisted(() => {
  const mQuery = vi.fn();
  return {
    mockQuery: mQuery,
    mockPool: { query: mQuery },
  };
});

vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => mockPool),
}));

import * as accountsService from '../../../src/services/accountsService.js';

describe('AccountsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('createPayable', () => {
    it('should create payable', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await accountsService.createPayable({ supplier_id: 1, description: 'D' });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO accounts_payable'),
        expect.any(Array),
      );
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getPayables', () => {
    it('should filter by branch, status, and date range', async () => {
      await accountsService.getPayables(1, 'pending', '2023-01-01', '2023-01-31');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ap.branch_id = $1 AND ap.status = $2 AND ap.due_date >= $3 AND ap.due_date <= $4'),
        [1, 'pending', '2023-01-01', '2023-01-31']
      );
    });

    it('should work without filters', async () => {
      await accountsService.getPayables();
      expect(mockQuery).toHaveBeenCalledWith(expect.not.stringContaining('WHERE'), []);
    });
  });

  describe('updatePayableStatus', () => {
    it('should update status', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await accountsService.updatePayableStatus(1, 'paid', '2023-01-05');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE accounts_payable SET status = $1, paid_date = $2 WHERE id = $3'),
        ['paid', '2023-01-05', 1]
      );
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getReceivables', () => {
    it('should filter by branch, status, and date range', async () => {
      await accountsService.getReceivables(2, 'received', '2023-02-01', '2023-02-28');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ar.branch_id = $1 AND ar.status = $2 AND ar.due_date >= $3 AND ar.due_date <= $4'),
        [2, 'received', '2023-02-01', '2023-02-28']
      );
    });

    it('should work without filters', async () => {
      await accountsService.getReceivables();
      expect(mockQuery).toHaveBeenCalledWith(expect.not.stringContaining('WHERE'), []);
    });
  });

  describe('Receivables CRUD', () => {
    it('should create receivable', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await accountsService.createReceivable({ customer_id: 1 });
      expect(result).toEqual({ id: 1 });
    });

    it('should update status', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await accountsService.updateReceivableStatus(1, 'received', '2023-01-01');
      expect(result).toEqual({ id: 1 });
    });
  });
});
