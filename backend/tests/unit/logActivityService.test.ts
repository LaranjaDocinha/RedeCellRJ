import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logActivityService } from '../../src/services/logActivityService.js';
import { getPool } from '../../src/db/index.js';

// Mock do pool do banco de dados
vi.mock('../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

describe('LogActivityService', () => {
  let mockQuery: vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = vi.fn().mockResolvedValue({});
    (getPool as vi.Mock).mockReturnValue({ query: mockQuery });
  });

  it('should successfully log an activity with all parameters', async () => {
    const options = {
      userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      action: 'User Updated Profile',
      resourceType: 'User',
      resourceId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      oldValue: { name: 'Old Name' },
      newValue: { name: 'New Name' },
      ipAddress: '192.168.1.1',
    };

    await logActivityService.logActivity(options);

    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO audit_logs'), [
      options.userId,
      options.action,
      options.resourceType,
      options.resourceId,
      expect.stringContaining('"diff":{"name":{"from":"Old Name","to":"New Name"}}'),
      options.ipAddress,
    ]);
  });

  it('should successfully log an activity with minimal parameters', async () => {
    const options = { action: 'Application Started' };

    await logActivityService.logActivity(options);

    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO audit_logs'), [
      undefined,
      options.action,
      undefined,
      null,
      expect.any(String),
      undefined,
    ]);
  });

  it('should log an error if the database query fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error('DB Error'));

    await logActivityService.logActivity({ action: 'TEST' });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to log activity:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
