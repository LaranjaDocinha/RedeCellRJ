import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userDashboardService from '../../../src/services/userDashboardService.js';
import { getPool } from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

describe('UserDashboardService', () => {
  const mockQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getPool as any).mockReturnValue({ query: mockQuery });
  });

  describe('getSettings', () => {
    it('should return settings if found', async () => {
      const mockSettings = { theme: 'dark' };
      mockQuery.mockResolvedValue({ rows: [mockSettings] });

      const result = await userDashboardService.getSettings('user1');
      expect(result).toEqual(mockSettings);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM user_dashboard_settings'),
        ['user1'],
      );
    });

    it('should return undefined if not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await userDashboardService.getSettings('user1');
      expect(result).toBeUndefined();
    });
  });

  describe('updateSettings', () => {
    it('should update and return settings', async () => {
      const newSettings = { theme: 'light' };
      mockQuery.mockResolvedValue({ rows: [newSettings] });

      const result = await userDashboardService.updateSettings('user1', newSettings);
      expect(result).toEqual(newSettings);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_dashboard_settings'),
        ['user1', newSettings],
      );
    });
  });
});
