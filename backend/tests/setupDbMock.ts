import { vi } from 'vitest';
import { getTestPool } from './testPool';

// Mock the db module
vi.mock('../src/db/index.ts', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: (_, prop) => Reflect.get(getTestPool(), prop),
    },
  ),
}));
