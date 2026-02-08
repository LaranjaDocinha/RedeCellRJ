import { describe, it, expect, vi, beforeEach } from 'vitest';
import { branchService } from '../../../src/services/branchService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('BranchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllBranches', () => {
    it('should return all branches from db', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);
      const res = await branchService.getAllBranches();
      expect(res).toHaveLength(1);
    });
  });

  describe('getBranchById', () => {
    it('should return a branch by id', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);
      const res = await branchService.getBranchById(1);
      expect(res?.id).toBe(1);
    });
  });

  describe('createBranch', () => {
    it('should create branch', async () => {
      const mockBranch = { id: 1, name: 'B1' };
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockBranch] } as any);

      const result = await branchService.createBranch({ name: 'B1' });
      expect(result).toEqual(mockBranch);
    });

    it('should throw AppError on duplicate name', async () => {
      const error: any = new Error('Dup');
      error.code = '23505';
      vi.mocked(pool.query).mockRejectedValueOnce(error);

      await expect(branchService.createBranch({ name: 'B1' })).rejects.toThrow(AppError);
    });

    it('should rethrow other errors', async () => {
      vi.mocked(pool.query).mockRejectedValueOnce(new Error('Other'));
      await expect(branchService.createBranch({ name: 'B1' })).rejects.toThrow('Other');
    });
  });

  describe('updateBranch', () => {
    it('should update branch with all fields', async () => {
      const mockBranch = { id: 1, name: 'B2', address: 'A', phone: 'P', email: 'E' };
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockBranch] } as any);

      const result = await branchService.updateBranch(1, { name: 'B2', address: 'A', phone: 'P', email: 'E' });
      expect(result).toEqual(mockBranch);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('name = $1, address = $2, phone = $3, email = $4'),
        ['B2', 'A', 'P', 'E', 1]
      );
    });

    it('should throw AppError if update results in duplicate name', async () => {
      const error: any = new Error('Dup');
      error.code = '23505';
      vi.mocked(pool.query).mockRejectedValueOnce(error);

      await expect(branchService.updateBranch(1, { name: 'Exists' })).rejects.toThrow(AppError);
    });

    it('should return existing branch if no fields provided', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: 1, name: 'B1' }] } as any);
      const result = await branchService.updateBranch(1, {});
      expect(result?.name).toBe('B1');
    });

    it('should return undefined if no fields and branch not found', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      const result = await branchService.updateBranch(1, {});
      expect(result).toBeUndefined();
    });
  });

  describe('deleteBranch', () => {
    it('should return true if deleted', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 1 } as any);
      const result = await branchService.deleteBranch(1);
      expect(result).toBe(true);
    });

    it('should return false if not found', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 0 } as any);
      const result = await branchService.deleteBranch(999);
      expect(result).toBe(false);
    });
  });
});
