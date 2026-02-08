import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gamificationEngine } from '../../../src/services/gamificationEngine.js';
import pool from '../../../src/db/index.js';
import appEvents from '../../../src/events/appEvents.js';

const { mockPoolInstance, mockQuery } = vi.hoisted(() => {
  const mQuery = vi.fn();
  return {
    mockQuery: mQuery,
    mockPoolInstance: { query: mQuery },
  };
});

vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => mockPoolInstance),
}));

vi.mock('../../../src/events/appEvents.js', () => ({
  default: {
    emit: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { getPool } from '../../../src/db/index.js';

describe('GamificationEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('processSale', () => {
    it('should process sale and emit event', async () => {
      const result = await gamificationEngine.processSale('u1', 100, []);
      expect(result.totalXP).toBe(0);
      expect(appEvents.emit).toHaveBeenCalledWith('gamification.xp.earned', expect.any(Object));
    });
  });

  describe('awardXP', () => {
    it('should add XP and update level', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ xp: 900, level: 1 }] }); // Current data
      
      await gamificationEngine.awardXP('u1', 200); // 900 + 200 = 1100 -> Level 2

      expect(appEvents.emit).toHaveBeenCalledWith('gamification.level.up', expect.objectContaining({ newLevel: 2 }));
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET xp = $1'), [1100, 2, 'u1']);
    });

    it('should not update level if threshold not reached', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ xp: 100, level: 1 }] });
      await gamificationEngine.awardXP('u1', 100);
      expect(appEvents.emit).not.toHaveBeenCalledWith('gamification.level.up', expect.any(Object));
    });

    it('should handle missing user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await gamificationEngine.awardXP('999', 100);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });
});
