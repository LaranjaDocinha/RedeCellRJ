import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as timeClockService from '../../../src/services/timeClockService.js';

// Mock do pool de conexão do PostgreSQL
const mockQuery = vi.fn();
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => ({
    query: mockQuery,
  })),
}));

describe('TimeClockService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('clockIn', () => {
    it('should clock in successfully if no open entry exists', async () => {
      const userId = 'user-123';
      const branchId = 1;

      // Mock finding existing open entry: returns empty
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const newEntry = {
        id: 1,
        user_id: userId,
        branch_id: branchId,
        clock_in_time: new Date(),
        clock_out_time: null,
      };
      mockQuery.mockResolvedValueOnce({ rows: [newEntry] });

      const result = await timeClockService.clockIn(userId, branchId);

      expect(result).toEqual(newEntry);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT * FROM time_clock_entries WHERE user_id = $1 AND clock_out_time IS NULL',
        [userId],
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO time_clock_entries (user_id, branch_id, clock_in_time) VALUES ($1, $2, NOW()) RETURNING *',
        [userId, branchId],
      );
    });

    it('should throw error if user is already clocked in', async () => {
      const userId = 'user-123';
      const branchId = 1;

      // Mock finding existing open entry: returns one row
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await expect(timeClockService.clockIn(userId, branchId)).rejects.toThrow(
        'User is already clocked in.',
      );
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('clockOut', () => {
    it('should clock out successfully if open entry exists', async () => {
      const userId = 'user-123';
      const updatedEntry = {
        id: 1,
        user_id: userId,
        clock_in_time: new Date(),
        clock_out_time: new Date(),
      };

      // Mock update returning the updated row
      mockQuery.mockResolvedValueOnce({ rows: [updatedEntry] });

      const result = await timeClockService.clockOut(userId);

      expect(result).toEqual(updatedEntry);
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE time_clock_entries SET clock_out_time = NOW() WHERE user_id = $1 AND clock_out_time IS NULL RETURNING *',
        [userId],
      );
    });

    it('should throw error if no open clock-in found', async () => {
      const userId = 'user-123';

      // Mock update returning empty rows (no row updated)
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(timeClockService.clockOut(userId)).rejects.toThrow(
        'No open clock-in found for this user.',
      );
    });
  });

  describe('getUserTimeClockEntries', () => {
    it('should return user entries within range', async () => {
      const userId = 'user-123';
      const start = '2023-01-01';
      const end = '2023-01-31';
      const entries = [{ id: 1 }, { id: 2 }];
      mockQuery.mockResolvedValueOnce({ rows: entries });

      const result = await timeClockService.getUserTimeClockEntries(userId, start, end);
      expect(result).toEqual(entries);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM time_clock_entries WHERE user_id = $1 AND clock_in_time >= $2 AND clock_in_time <= $3 ORDER BY clock_in_time DESC',
        [userId, start, end],
      );
    });
  });

  describe('getBranchTimeClockEntries', () => {
    it('should return branch entries within range', async () => {
      const branchId = 1;
      const start = '2023-01-01';
      const end = '2023-01-31';
      const entries = [{ id: 1, user_name: 'John' }];
      mockQuery.mockResolvedValueOnce({ rows: entries });

      const result = await timeClockService.getBranchTimeClockEntries(branchId, start, end);
      expect(result).toEqual(entries);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT t.*, u.name as user_name FROM time_clock_entries t JOIN users u ON t.user_id = u.id WHERE t.branch_id = $1 AND t.clock_in_time >= $2 AND t.clock_in_time <= $3 ORDER BY t.clock_in_time DESC',
        [branchId, start, end],
      );
    });
  });

  describe('getLatestUserEntry', () => {
    it('should return the latest entry for a user', async () => {
      const userId = 'user-123';
      const entry = { id: 1 };
      mockQuery.mockResolvedValueOnce({ rows: [entry] });

      const result = await timeClockService.getLatestUserEntry(userId);
      expect(result).toEqual(entry);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM time_clock_entries WHERE user_id = $1 ORDER BY clock_in_time DESC LIMIT 1',
        [userId],
      );
    });
  });
});
