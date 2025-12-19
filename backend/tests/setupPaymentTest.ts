import { vi } from 'vitest';

vi.mock('node-cron', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    schedule: vi.fn(),
  };
});
