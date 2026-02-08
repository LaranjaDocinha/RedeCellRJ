import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from '../../../src/services/auditService.js';
import pool from '../../../src/db/index.js';
import * as contextModule from '../../../src/utils/context.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { error: vi.fn() },
}));

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(contextModule, 'getContext').mockReturnValue({ userId: 'u1' } as any);
  });

  describe('logStockChange', () => {
    it('should log stock change to db', async () => {
      await auditService.logStockChange({
        productVariationId: 1,
        branchId: 1,
        oldQuantity: 10,
        newQuantity: 5,
        reason: 'sale'
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO stock_history'),
        expect.arrayContaining([1, 1, 10, 5, 'sale', undefined, 'u1'])
      );
    });

    it('should use provided client if available', async () => {
      const mockClient = { query: vi.fn() };
      await auditService.logStockChange({
        productVariationId: 1,
        branchId: 1,
        oldQuantity: 10,
        newQuantity: 5,
        reason: 'sale',
        client: mockClient
      });

      expect(mockClient.query).toHaveBeenCalled();
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('logProductChange', () => {
    it('should log product snapshot to history', async () => {
      const snapshot = { name: 'P', sku: 'S', is_serialized: false };
      await auditService.logProductChange(1, 'UPDATE', snapshot);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products_history'),
        [1, 'P', 'S', false, 'UPDATE', JSON.stringify(snapshot), 'u1']
      );
    });
  });

  describe('logAction', () => {
    it('should insert audit log', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      await auditService.logAction('u1', 'CREATE', 'User', { details: 'info' });

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO audit_logs'), [
        'u1',
        'CREATE',
        'User',
        '{"details":"info"}',
      ]);
    });

    it('should catch error silently', async () => {
      vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await auditService.logAction('u1', 'TEST', 'Entity', {});

      expect(consoleSpy).toHaveBeenCalledWith('Audit log failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
