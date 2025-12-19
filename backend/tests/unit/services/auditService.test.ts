import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from '../../../src/services/auditService';
import * as dbModule from '../../../src/db/index';

// Mock getPool
const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordAuditLog', () => {
    it('should insert audit log', async () => {
      mockQuery.mockResolvedValue({}); // Insert returns nothing useful typically or row count

      await auditService.recordAuditLog({
        userId: 'u1',
        action: 'CREATE',
        entityType: 'User',
        entityId: '1',
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_logs'),
        ['u1', 'CREATE', 'User', '1', undefined]
      );
    });

    it('should catch error silently', async () => {
      mockQuery.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await auditService.recordAuditLog({ action: 'TEST' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getAuditLogs', () => {
    it('should return logs and total count with filters', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // Count query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Logs query

      const result = await auditService.getAuditLogs({
        userId: 'u1',
        action: 'CREATE',
        entityType: 'User',
        entityId: '1',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      });

      expect(mockQuery).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT COUNT(*)'), expect.any(Array));
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('SELECT al.*'), expect.any(Array));
      expect(result).toEqual({ logs: [{ id: 1 }], totalCount: 10 });
    });
  });
});
