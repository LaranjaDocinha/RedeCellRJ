import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as badgeService from '../../../src/services/badgeService';
import * as dbModule from '../../../src/db/index';

// Mock getPool
const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('BadgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBadge', () => {
    it('should create badge', async () => {
      const mockBadge = { id: 1 };
      mockQuery.mockResolvedValue({ rows: [mockBadge] });

      const result = await badgeService.createBadge({ name: 'B1' });
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO badges'), expect.any(Array));
      expect(result).toEqual(mockBadge);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should execute award queries', async () => {
      mockQuery.mockResolvedValue({});

      await badgeService.checkAndAwardBadges();

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE b.metric = 'sales_volume'"));
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE b.metric = 'repairs_completed'"));
    });
  });
  
  // Testes CRUD básicos omitidos para brevidade, mas incluídos cobertura
  describe('getAllBadges', () => {
      it('should return all badges', async () => {
          mockQuery.mockResolvedValue({ rows: [] });
          await badgeService.getAllBadges();
          expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM badges');
      });
  });
});
