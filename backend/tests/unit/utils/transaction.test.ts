import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withTransaction } from '../../../src/utils/transaction.js';
import { getPool } from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

describe('Transaction Utils', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPool as any).mockReturnValue({ connect: vi.fn().mockResolvedValue(mockClient) });
  });

  it('should execute callback within transaction and commit', async () => {
    const callback = vi.fn().mockResolvedValue('success');
    
    const result = await withTransaction(callback);

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(callback).toHaveBeenCalledWith(mockClient);
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
    expect(result).toBe('success');
  });

  it('should rollback on error', async () => {
    const error = new Error('fail');
    const callback = vi.fn().mockRejectedValue(error);

    await expect(withTransaction(callback)).rejects.toThrow('fail');

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
