import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cogsService from '../../../src/services/cogsService.js';
import { getPool } from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  const mockRelease = vi.fn();
  const mockConnect = vi.fn(() => ({
    query: mockQuery,
    release: mockRelease,
  }));
  return {
    getPool: vi.fn(() => ({
      connect: mockConnect,
    })),
  };
});

describe('cogsService', () => {
  it('generateCogsReport should query COGS data', async () => {
    const mockClient = (await getPool().connect()) as any;
    mockClient.query.mockResolvedValueOnce({
      rows: [{ total_cogs: '1500.50' }],
    });

    const result = await cogsService.generateCogsReport('2023-01-01', '2023-01-31');

    expect(result).toEqual({ total_cogs: '1500.50' });
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [
      '2023-01-01',
      '2023-01-31',
    ]);
    expect(mockClient.release).toHaveBeenCalled();
  });
});
