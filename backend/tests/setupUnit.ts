// Setup for Unit Tests
import { vi } from 'vitest';

// Global environment variables
process.env.JWT_SECRET = 'unit-test-secret';
process.env.NODE_ENV = 'test';

// Global DB Mock
vi.mock('../src/db/index.js', () => {
  const mockPool = {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: vi.fn(),
    }),
  };
  return {
    getPool: vi.fn(() => mockPool),
    setPool: vi.fn(),
    query: mockPool.query,
    connect: mockPool.connect,
    default: mockPool,
  };
});

// Mock for Redis
const mockRedis = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  setEx: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  on: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
  isOpen: true,
  quit: vi.fn().mockResolvedValue(undefined),
  sendCommand: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../src/utils/redisClient.js', () => ({
  default: mockRedis,
  redisClient: mockRedis,
}));

// Global Context Mock
vi.mock('../src/utils/context.js', () => ({
  context: {
    run: vi.fn((ctx, fn) => fn()),
    getStore: vi.fn(),
  },
  getContext: vi.fn().mockReturnValue({ userId: 'test-user', ip: '127.0.0.1' }),
  getLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  }),
  runWithContext: vi.fn((ctx, fn) => fn()),
}));
