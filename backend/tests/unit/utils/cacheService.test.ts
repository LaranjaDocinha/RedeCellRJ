import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheService } from '../../../src/utils/cacheService.js';
import redisClient from '../../../src/utils/redisClient.js';

vi.mock('../../../src/utils/redisClient.js', () => ({
  default: {
    isOpen: true,
    get: vi.fn(),
    set: vi.fn(),
    keys: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { error: vi.fn() },
}));

describe('CacheService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisClient.isOpen = true;
  });

  describe('wrap', () => {
    it('should return cached data if available', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce(JSON.stringify({ data: 'cached' }));
      const fn = vi.fn();

      const result = await cacheService.wrap('key', 100, fn);

      expect(result).toEqual({ data: 'cached' });
      expect(fn).not.toHaveBeenCalled();
    });

    it('should call function and cache result if not available', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce(null);
      const fn = vi.fn().mockResolvedValue({ data: 'new' });

      const result = await cacheService.wrap('key', 100, fn);

      expect(result).toEqual({ data: 'new' });
      expect(redisClient.set).toHaveBeenCalledWith('key', JSON.stringify({ data: 'new' }), { EX: 100 });
    });

    it('should fallback to function if redis is closed', async () => {
      redisClient.isOpen = false;
      const fn = vi.fn().mockResolvedValue('direct');
      const result = await cacheService.wrap('key', 100, fn);
      expect(result).toBe('direct');
      expect(redisClient.get).not.toHaveBeenCalled();
    });

    it('should fallback to function and log error if redis fails', async () => {
      vi.mocked(redisClient.get).mockRejectedValueOnce(new Error('Fail'));
      const fn = vi.fn().mockResolvedValue('fallback');
      const result = await cacheService.wrap('key', 100, fn);
      expect(result).toBe('fallback');
    });
  });

  describe('invalidate', () => {
    it('should delete keys matching pattern', async () => {
      vi.mocked(redisClient.keys).mockResolvedValueOnce(['k1', 'k2']);
      await cacheService.invalidate('pattern*');
      expect(redisClient.del).toHaveBeenCalledWith(['k1', 'k2']);
    });

    it('should do nothing if no keys match', async () => {
      vi.mocked(redisClient.keys).mockResolvedValueOnce([]);
      await cacheService.invalidate('pattern*');
      expect(redisClient.del).not.toHaveBeenCalled();
    });

    it('should do nothing if redis is closed', async () => {
      redisClient.isOpen = false;
      await cacheService.invalidate('p*');
      expect(redisClient.keys).not.toHaveBeenCalled();
    });
  });
});
