import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userMoodService } from '../../../src/services/userMoodService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('UserMoodService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordMood', () => {
    it('should record mood successfully', async () => {
      const mockLog = { id: 1, user_id: 'u1', mood_level: 5 };
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockLog] } as any);

      const result = await userMoodService.recordMood('u1', 5, 'Good day');

      expect(result).toEqual(mockLog);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_mood_logs'),
        ['u1', 5, 'Good day']
      );
    });
  });

  describe('hasCheckedInToday', () => {
    it('should return true if log exists for today', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);
      const result = await userMoodService.hasCheckedInToday('u1');
      expect(result).toBe(true);
    });

    it('should return false if no log for today', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);
      const result = await userMoodService.hasCheckedInToday('u1');
      expect(result).toBe(false);
    });
  });
});
