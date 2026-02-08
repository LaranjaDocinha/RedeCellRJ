import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as activityFeedService from '../../../src/services/activityFeedService';
import * as dbModule from '../../../src/db/index';

// Mock getPool
const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('ActivityFeedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createActivity', () => {
    it('should insert activity using default pool', async () => {
      const mockResult = { rows: [{ id: 1 }] };
      mockQuery.mockResolvedValue(mockResult);

      const result = await activityFeedService.createActivity('1', 1, 'LOGIN', {});

      expect(dbModule.getPool).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO activity_feed'), [
        '1',
        1,
        'LOGIN',
        {},
      ]);
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should insert activity using provided client', async () => {
      const mockClient = { query: vi.fn() } as any;
      const mockResult = { rows: [{ id: 2 }] };
      mockClient.query.mockResolvedValue(mockResult);

      const result = await activityFeedService.createActivity('1', 1, 'LOGIN', {}, mockClient);

      expect(dbModule.getPool).not.toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO activity_feed'),
        ['1', 1, 'LOGIN', {}],
      );
      expect(result).toEqual(mockResult.rows[0]);
    });
  });

  describe('getFeed', () => {
    it('should fetch feed with default params', async () => {
      const mockRows = [{ id: 1, action: 'test' }];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const result = await activityFeedService.getFeed();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1 OFFSET $2'),
        [20, 0],
      );
      expect(result).toEqual(mockRows);
    });

    it('should fetch feed with branchId filter', async () => {
      const mockRows = [{ id: 1, action: 'test' }];
      mockQuery.mockResolvedValue({ rows: mockRows });

      await activityFeedService.getFeed(1, 10, 5);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE af.branch_id = $1'),
        [1, 10, 5],
      );
    });
  });
});
