
import { vi } from 'vitest';

// Mock Redis (node-redis)
vi.mock('redis', () => {
  return {
    createClient: () => ({
      connect: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      disconnect: vi.fn().mockResolvedValue(undefined),
      quit: vi.fn().mockResolvedValue(undefined),
      isOpen: true,
    }),
  };
});

// Mock IORedis (used by BullMQ)
vi.mock('ioredis', () => {
  return {
    default: class RedisMock {
      constructor() {}
      connect() { return Promise.resolve(); }
      on(event: string, callback: any) { return this; }
      get() { return Promise.resolve(null); }
      set() { return Promise.resolve('OK'); }
      del() { return Promise.resolve(1); }
      quit() { return Promise.resolve(); }
      disconnect() { return Promise.resolve(); }
      status = 'ready';
      emit(event: string, ...args: any[]) { return true; }
    },
  };
});
