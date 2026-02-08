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

import * as badgeService from '../../../src/services/badgeService.js';

describe('BadgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('createBadge', () => {
    it('should create badge', async () => {
      const mockBadge = { id: 1 };
      mockQuery.mockResolvedValueOnce({ rows: [mockBadge] });

      const result = await badgeService.createBadge({ name: 'B1' });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO badges'),
        expect.any(Array),
      );
      expect(result).toEqual(mockBadge);
    });
  });

  describe('getAllBadges', () => {
    it('should return all badges from repository', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await badgeService.getAllBadges();
      expect(result).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM badges');
    });
  });

  describe('getBadgeById', () => {
    it('should return badge by id', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await badgeService.getBadgeById(1);
      expect(result.id).toBe(1);
    });
  });

  describe('updateBadge', () => {
    it('should update badge in db', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Updated' }] });
      const result = await badgeService.updateBadge(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE badges'), expect.any(Array));
    });
  });

  describe('deleteBadge', () => {
    it('should call delete query', async () => {
      await badgeService.deleteBadge(1);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM badges WHERE id = $1', [1]);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should execute award queries', async () => {
      await badgeService.checkAndAwardBadges();

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE b.metric = 'sales_volume'"),
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE b.metric = 'repairs_completed'"),
      );
    });
  });
});
