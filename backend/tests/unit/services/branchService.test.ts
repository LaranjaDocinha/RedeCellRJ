import { describe, it, expect, vi, beforeEach } from 'vitest';
import { branchService } from '../../../src/services/branchService';
import pool from '../../../src/db/index';
import { AppError } from '../../../src/utils/errors';

vi.mock('../../../src/db/index', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('BranchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
  });

  describe('createBranch', () => {
    it('should create branch', async () => {
      const mockBranch = { id: 1, name: 'B1' };
      (pool.query as any).mockResolvedValue({ rows: [mockBranch] });

      const result = await branchService.createBranch({ name: 'B1' });
      expect(result).toEqual(mockBranch);
    });

    it('should throw AppError on duplicate name', async () => {
      const error: any = new Error('Dup');
      error.code = '23505';
      (pool.query as any).mockRejectedValue(error);

      await expect(branchService.createBranch({ name: 'B1' })).rejects.toThrow(AppError);
    });

    it('should rethrow other errors', async () => {
        (pool.query as any).mockRejectedValue(new Error('Other'));
        await expect(branchService.createBranch({ name: 'B1' })).rejects.toThrow('Other');
    });
  });

  describe('updateBranch', () => {
    it('should update branch', async () => {
        const mockBranch = { id: 1, name: 'B1' };
        const mockUpdatedBranch = { ...mockBranch, name: 'B2' };
        // Apenas uma chamada ao pool.query (UPDATE) é esperada quando há campos
        (pool.query as any).mockResolvedValueOnce({ rows: [mockUpdatedBranch] }); 

        const result = await branchService.updateBranch(1, { name: 'B2' });
        expect(result).toEqual(mockUpdatedBranch);
        expect(pool.query).toHaveBeenCalledTimes(1); 
        expect(pool.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE branches SET name = $1'),
          expect.arrayContaining(['B2', 1])
        );
    });

    it('should return undefined if branch not found', async () => {
        // UPDATE retorna vazio se ID não existe
        (pool.query as any).mockResolvedValueOnce({ rows: [] }); 
        const result = await branchService.updateBranch(1, { name: 'B2' });
        expect(result).toBeUndefined();
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should return existing branch if no fields', async () => {
        const mockBranch = { id: 1 };
        (pool.query as any).mockResolvedValue({ rows: [mockBranch] });
        const result = await branchService.updateBranch(1, {});
        expect(result).toEqual(mockBranch);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});
