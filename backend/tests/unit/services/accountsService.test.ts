import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as accountsService from '../../../src/services/accountsService';
import * as dbModule from '../../../src/db/index';

const mockQuery = vi.fn();
const mockPool = { query: mockQuery };

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('AccountsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPayable', () => {
    it('should create payable', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await accountsService.createPayable({});
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO accounts_payable'), expect.any(Array));
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getPayables', () => {
    it('should return payables', async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await accountsService.getPayables(1, 'pending');
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT ap.*'), expect.any(Array));
      expect(result).toEqual([]);
    });
  });

  describe('updatePayableStatus', () => {
    it('should update status', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await accountsService.updatePayableStatus(1, 'paid');
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('createReceivable', () => {
    it('should create receivable', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await accountsService.createReceivable({});
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getReceivables', () => {
    it('should return receivables', async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await accountsService.getReceivables();
      expect(result).toEqual([]);
    });
  });

  describe('updateReceivableStatus', () => {
    it('should update status', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await accountsService.updateReceivableStatus(1, 'received');
      expect(result).toEqual({ id: 1 });
    });
  });
});
