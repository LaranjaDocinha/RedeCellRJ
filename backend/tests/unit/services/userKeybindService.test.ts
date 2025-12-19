import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userKeybindService } from '../../../src/services/userKeybindService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('UserKeybindService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserKeybinds', () => {
    it('should return keybinds for user', async () => {
      const mockKeybinds = [{ id: 1, action_name: 'save' }];
      (pool.query as any).mockResolvedValue({ rows: mockKeybinds });

      const result = await userKeybindService.getUserKeybinds('user1');
      expect(result).toEqual(mockKeybinds);
      expect(pool.query).toHaveBeenCalledWith(
          expect.stringContaining('WHERE user_id = $1'),
          ['user1']
      );
    });

    it('should filter by context', async () => {
        (pool.query as any).mockResolvedValue({ rows: [] });
        await userKeybindService.getUserKeybinds('user1', 'editor');
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('AND context = $2'),
            ['user1', 'editor']
        );
    });
  });

  describe('createKeybind', () => {
    it('should create keybind', async () => {
      const payload = { user_id: '1', action_name: 'save', key_combination: 'ctrl+s' };
      (pool.query as any).mockResolvedValue({ rows: [payload] });

      const result = await userKeybindService.createKeybind(payload);
      expect(result).toEqual(payload);
    });

    it('should throw AppError on unique violation', async () => {
      (pool.query as any).mockRejectedValue({ code: '23505' });

      await expect(userKeybindService.createKeybind({ 
          user_id: '1', action_name: 'a', key_combination: 'k' 
      })).rejects.toThrow('Keybind for this action and user already exists.');
    });

    it('should rethrow other errors', async () => {
        (pool.query as any).mockRejectedValue(new Error('DB Error'));
        await expect(userKeybindService.createKeybind({ 
            user_id: '1', action_name: 'a', key_combination: 'k' 
        })).rejects.toThrow('DB Error');
    });
  });

  describe('updateKeybind', () => {
    it('should update keybind', async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await userKeybindService.updateKeybind(1, { context: 'new' });
      expect(result).toBeDefined();
    });

    it('should throw if no fields to update', async () => {
      await expect(userKeybindService.updateKeybind(1, {}))
        .rejects.toThrow('No fields to update.');
    });

    it('should throw if keybind not found', async () => {
        (pool.query as any).mockResolvedValue({ rows: [] });
        await expect(userKeybindService.updateKeybind(1, { context: 'new' }))
          .rejects.toThrow('Keybind not found.');
    });
  });

  describe('deleteKeybind', () => {
    it('should delete keybind', async () => {
      (pool.query as any).mockResolvedValue({ rowCount: 1 });
      const result = await userKeybindService.deleteKeybind(1);
      expect(result).toBe(true);
    });
  });
});
