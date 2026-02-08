import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as taskTimeLogService from '../../../src/services/taskTimeLogService.js';

// Mock do pool de conexão do PostgreSQL
const mockQuery = vi.fn();
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => ({
    query: mockQuery,
  })),
}));

describe('TaskTimeLogService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('startTimer', () => {
    it('should start timer if no active timer exists for task', async () => {
      const userId = 'u1';
      const serviceOrderId = 100;

      // Check existing: empty
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const newLog = {
        id: 1,
        user_id: userId,
        service_order_id: serviceOrderId,
        start_time: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [newLog] });

      const result = await taskTimeLogService.startTimer(userId, serviceOrderId);
      expect(result).toEqual(newLog);

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT * FROM task_time_log WHERE user_id = $1 AND service_order_id = $2 AND end_time IS NULL',
        [userId, serviceOrderId],
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO task_time_log (user_id, service_order_id, start_time) VALUES ($1, $2, NOW()) RETURNING *',
        [userId, serviceOrderId],
      );
    });

    it('should throw error if timer already running', async () => {
      const userId = 'u1';
      const serviceOrderId = 100;

      // Check existing: found
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await expect(taskTimeLogService.startTimer(userId, serviceOrderId)).rejects.toThrow(
        'Timer is already running for this task.',
      );
    });
  });

  describe('stopTimer', () => {
    it('should stop active timer', async () => {
      const userId = 'u1';
      const serviceOrderId = 100;
      const notes = 'Done';
      const updatedLog = { id: 1, end_time: new Date() };

      mockQuery.mockResolvedValueOnce({ rows: [updatedLog] });

      const result = await taskTimeLogService.stopTimer(userId, serviceOrderId, notes);
      expect(result).toEqual(updatedLog);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE task_time_log SET end_time = NOW(), notes = $3 WHERE user_id = $1 AND service_order_id = $2 AND end_time IS NULL RETURNING *',
        [userId, serviceOrderId, notes],
      );
    });

    it('should throw error if no active timer found', async () => {
      const userId = 'u1';
      const serviceOrderId = 100;

      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(taskTimeLogService.stopTimer(userId, serviceOrderId)).rejects.toThrow(
        'No active timer found for this task.',
      );
    });
  });

  describe('getLogsForServiceOrder', () => {
    it('should return logs', async () => {
      const logs = [{ id: 1 }, { id: 2 }];
      mockQuery.mockResolvedValueOnce({ rows: logs });

      const result = await taskTimeLogService.getLogsForServiceOrder(100);
      expect(result).toEqual(logs);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT ttl.*, u.name as user_name FROM task_time_log ttl JOIN users u ON ttl.user_id = u.id WHERE ttl.service_order_id = $1 ORDER BY ttl.start_time DESC',
        [100],
      );
    });
  });

  describe('getActiveTimerForUser', () => {
    it('should return active timer if exists', async () => {
      const log = { id: 1 };
      mockQuery.mockResolvedValueOnce({ rows: [log] });

      const result = await taskTimeLogService.getActiveTimerForUser('u1', 100);
      expect(result).toEqual(log);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM task_time_log WHERE user_id = $1 AND service_order_id = $2 AND end_time IS NULL',
        ['u1', 100],
      );
    });
  });
});
