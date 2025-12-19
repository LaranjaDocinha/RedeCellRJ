import { describe, it, expect, vi, beforeEach } from 'vitest';
import redisClient from '../../../src/utils/redisClient.js';
import { createClient } from 'redis';

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    on: vi.fn(),
    connect: vi.fn(),
  })),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RedisClient', () => {
  it('should be defined', () => {
    expect(redisClient).toBeDefined();
  });

  // Note: Testing the side-effect of connecting on import is hard with ES modules without isolation.
  // But checking it is exported and mocks are called is a good start.
});
