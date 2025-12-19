import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as shiftService from '../../../src/services/shiftService.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do pool de conexão do PostgreSQL
const mockQuery = vi.fn();
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => ({
    query: mockQuery,
  })),
}));

describe('ShiftService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('createShift', () => {
    it('should create a new shift successfully', async () => {
      const shiftData = {
        user_id: 'user-123',
        branch_id: 1,
        start_time: '2023-10-27T09:00:00Z',
        end_time: '2023-10-27T17:00:00Z',
        role: 'Cashier',
      };
      const expectedShift = { id: 1, ...shiftData };
      mockQuery.mockResolvedValueOnce({ rows: [expectedShift] });

      const result = await shiftService.createShift(shiftData);

      expect(result).toEqual(expectedShift);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO shifts (user_id, branch_id, start_time, end_time, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [shiftData.user_id, shiftData.branch_id, shiftData.start_time, shiftData.end_time, shiftData.role]
      );
    });

    it('should throw error if database query fails', async () => {
      const shiftData = {
        user_id: 'user-123',
        branch_id: 1,
        start_time: '2023-10-27T09:00:00Z',
        end_time: '2023-10-27T17:00:00Z',
        role: 'Cashier',
      };
      const dbError = new Error('DB Error');
      mockQuery.mockRejectedValueOnce(dbError);

      await expect(shiftService.createShift(shiftData)).rejects.toThrow(dbError);
    });
  });

  describe('getShifts', () => {
    it('should return shifts within date range', async () => {
      const start = '2023-10-01';
      const end = '2023-10-31';
      const mockShifts = [{ id: 1, user_id: 'u1', user_name: 'User 1' }];
      mockQuery.mockResolvedValueOnce({ rows: mockShifts });

      const result = await shiftService.getShifts(start, end);

      expect(result).toEqual(mockShifts);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT s.*, u.name as user_name FROM shifts s JOIN users u ON s.user_id = u.id WHERE s.start_time >= $1 AND s.end_time <= $2',
        [start, end]
      );
    });

    it('should filter shifts by branchId if provided', async () => {
      const start = '2023-10-01';
      const end = '2023-10-31';
      const branchId = 5;
      const mockShifts = [{ id: 1, user_id: 'u1', branch_id: 5 }];
      mockQuery.mockResolvedValueOnce({ rows: mockShifts });

      const result = await shiftService.getShifts(start, end, branchId);

      expect(result).toEqual(mockShifts);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT s.*, u.name as user_name FROM shifts s JOIN users u ON s.user_id = u.id WHERE s.start_time >= $1 AND s.end_time <= $2 AND s.branch_id = $3',
        [start, end, "5"]
      );
    });
  });

  describe('updateShift', () => {
    it('should update a shift successfully', async () => {
      const id = 1;
      const shiftData = {
        user_id: 'user-123',
        branch_id: 2,
        start_time: '2023-10-28T09:00:00Z',
        end_time: '2023-10-28T17:00:00Z',
        role: 'Manager',
      };
      const updatedShift = { id, ...shiftData };
      mockQuery.mockResolvedValueOnce({ rows: [updatedShift] });

      const result = await shiftService.updateShift(id, shiftData);

      expect(result).toEqual(updatedShift);
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE shifts SET user_id = $1, branch_id = $2, start_time = $3, end_time = $4, role = $5 WHERE id = $6 RETURNING *',
        [shiftData.user_id, shiftData.branch_id, shiftData.start_time, shiftData.end_time, shiftData.role, id]
      );
    });
  });

  describe('deleteShift', () => {
    it('should delete a shift successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      await shiftService.deleteShift(1);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM shifts WHERE id = $1', [1]);
    });
  });
});
