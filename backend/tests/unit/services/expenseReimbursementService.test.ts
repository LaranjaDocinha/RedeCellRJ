import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as expenseReimbursementService from '../../../src/services/expenseReimbursementService';
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

describe('ExpenseReimbursementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createRequest', () => {
    it('should create a reimbursement request', async () => {
      const payload = {
        user_id: 1,
        branch_id: 1,
        amount: 100,
        description: 'Lunch',
        receipt_url: 'url',
      };
      const created = { id: 1, ...payload, status: 'pending' };
      mockClientQuery.mockResolvedValueOnce({ rows: [created] });

      const result = await expenseReimbursementService.createRequest(payload);

      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO expense_reimbursements'),
        [1, 1, 100, 'Lunch', 'url'],
      );
      expect(result).toEqual(created);
    });
  });

  describe('getRequests', () => {
    it('should return requests filtered by status', async () => {
      const requests = [{ id: 1, status: 'pending' }];
      mockClientQuery.mockResolvedValueOnce({ rows: requests });

      const result = await expenseReimbursementService.getRequests('pending');

      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE er.status = $1'),
        ['pending'],
      );
      expect(result).toEqual(requests);
    });

    it('should return requests filtered by branch', async () => {
      mockClientQuery.mockResolvedValueOnce({ rows: [] });

      await expenseReimbursementService.getRequests(undefined, 2);

      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE er.branch_id = $1'),
        [2],
      );
    });
  });

  describe('getUserRequests', () => {
    it('should return requests for a user', async () => {
      const requests = [{ id: 1, user_id: 1 }];
      mockClientQuery.mockResolvedValueOnce({ rows: requests });

      const result = await expenseReimbursementService.getUserRequests('1');

      expect(mockClientQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), [
        '1',
      ]);
      expect(result).toEqual(requests);
    });
  });

  describe('approveRequest', () => {
    it('should approve a request', async () => {
      const approved = { id: 1, status: 'approved' };
      mockClientQuery.mockResolvedValueOnce({ rows: [approved] });

      const result = await expenseReimbursementService.approveRequest(1, 'admin1');

      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE expense_reimbursements SET status = 'approved'"),
        ['admin1', 1],
      );
      expect(result).toEqual(approved);
    });
  });

  describe('rejectRequest', () => {
    it('should reject a request', async () => {
      const rejected = { id: 1, status: 'rejected' };
      mockClientQuery.mockResolvedValueOnce({ rows: [rejected] });

      const result = await expenseReimbursementService.rejectRequest(1, 'admin1');

      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE expense_reimbursements SET status = 'rejected'"),
        ['admin1', 1],
      );
      expect(result).toEqual(rejected);
    });
  });
});
