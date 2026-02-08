import { describe, it, expect, vi, beforeEach } from 'vitest';
import { featureFlagService } from '../../../src/services/featureFlagService.js';
import redisClient from '../../../src/utils/redisClient.js';

vi.mock('../../../src/utils/redisClient.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

describe('FeatureFlagService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isEnabled', () => {
    it('should return true if cached value is "true"', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce('true');
      const res = await featureFlagService.isEnabled('test');
      expect(res).toBe(true);
    });

    it('should return false if cached value is "false"', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce('false');
      const res = await featureFlagService.isEnabled('test');
      expect(res).toBe(false);
    });

    it('should return defaultValue and set cache on miss', async () => {
      vi.mocked(redisClient.get).mockResolvedValueOnce(null);
      const res = await featureFlagService.isEnabled('miss', true);
      expect(res).toBe(true);
      expect(redisClient.set).toHaveBeenCalledWith('feature:miss', 'true');
    });

    it('should return defaultValue and log error on failure', async () => {
      vi.mocked(redisClient.get).mockRejectedValueOnce(new Error('Redis Error'));
      const res = await featureFlagService.isEnabled('fail', true);
      expect(res).toBe(true);
    });
  });

  describe('setFlag', () => {
    it('should set flag in redis', async () => {
      await featureFlagService.setFlag('test', true);
      expect(redisClient.set).toHaveBeenCalledWith('feature:test', 'true');
    });
  });
});
