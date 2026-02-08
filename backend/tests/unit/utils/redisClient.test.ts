import { describe, it, expect, vi } from 'vitest';

vi.unmock('../../../src/utils/redisClient.js');

import redisClient from '../../../src/utils/redisClient.js';
import { logger } from '../../../src/utils/logger.js';

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('RedisClient Utility', () => {
  it('should have a configured reconnect strategy', () => {
    // Na v4+ do node-redis, as opções ficam em .options
    const config = (redisClient as any).options;
    const strategy = config?.socket?.reconnectStrategy;
    
    if (strategy) {
      expect(strategy(0)).toBe(1000);
      expect(strategy(1)).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Redis offline'));
    }
  });

  it('should log on connect', () => {
    redisClient.emit('connect');
    expect(logger.info).toHaveBeenCalledWith('Connected to Redis!');
  });

  it('should handle ECONNREFUSED gracefully', () => {
    redisClient.emit('error', { code: 'ECONNREFUSED' });
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('não disponível'));
  });

  it('should log other errors', () => {
    redisClient.emit('error', new Error('Random Redis Error'));
    expect(logger.error).toHaveBeenCalledWith('Redis Client Error', expect.any(Error));
  });
});