import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ipWhitelistService } from '../../../src/services/ipWhitelistService.js';
import pool from '../../../src/db/index.js';
import { AppError, NotFoundError } from '../../../src/utils/errors.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('IpWhitelistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllEntries', () => {
    it('should return all entries', async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1, ip_address: '1.2.3.4' }] });
      const result = await ipWhitelistService.getAllEntries();
      expect(result).toHaveLength(1);
    });
  });

  describe('createEntry', () => {
    it('should create a new entry', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 1, ip_address: '1.1.1.1' }] });
        const result = await ipWhitelistService.createEntry({ ip_address: '1.1.1.1' });
        expect(result.ip_address).toBe('1.1.1.1');
    });

    it('should throw error if IP exists', async () => {
        (pool.query as any).mockRejectedValue({ code: '23505' });
        await expect(ipWhitelistService.createEntry({ ip_address: '1.1.1.1' }))
            .rejects.toThrow('IP address 1.1.1.1 already exists in whitelist.');
    });

    it('should throw generic error on failure', async () => {
        (pool.query as any).mockRejectedValue(new Error('Other'));
        await expect(ipWhitelistService.createEntry({ ip_address: '1.1.1.1' }))
            .rejects.toThrow('Failed to create IP whitelist entry.');
    });
  });

  describe('updateEntry', () => {
      it('should update entry', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 1, is_active: false }] });
        const result = await ipWhitelistService.updateEntry(1, { is_active: false });
        expect(result.is_active).toBe(false);
      });

      it('should throw NotFoundError if update affects no rows', async () => {
          (pool.query as any).mockResolvedValue({ rows: [] });
          await expect(ipWhitelistService.updateEntry(1, { is_active: false }))
            .rejects.toThrow(NotFoundError);
      });

      it('should return existing if no fields to update', async () => {
          (pool.query as any).mockResolvedValue({ rows: [{ id: 1, ip_address: '1.1.1.1' }] });
          const result = await ipWhitelistService.updateEntry(1, {});
          expect(result.ip_address).toBe('1.1.1.1');
          expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM ip_whitelist'), [1]);
      });
      
      it('should throw NotFoundError if entry not found and no fields to update', async () => {
        (pool.query as any).mockResolvedValue({ rows: [] });
        await expect(ipWhitelistService.updateEntry(1, {}))
          .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteEntry', () => {
      it('should delete entry', async () => {
          (pool.query as any).mockResolvedValue({ rowCount: 1 });
          const result = await ipWhitelistService.deleteEntry(1);
          expect(result).toBe(true);
      });
  });

  describe('getActiveWhitelistedIps', () => {
      it('should return list of IPs', async () => {
          (pool.query as any).mockResolvedValue({ rows: [{ ip_address: '1.2.3.4' }, { ip_address: '5.6.7.8' }] });
          const result = await ipWhitelistService.getActiveWhitelistedIps();
          expect(result).toEqual(['1.2.3.4', '5.6.7.8']);
      });
  });
});