import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compatibilityService } from '../../../src/services/compatibilityService.js';
import pool from '../../../src/db/index.js';

const mocks = vi.hoisted(() => {
  const mQuery = vi.fn();
  const mClient = { query: mQuery, release: vi.fn() };
  return {
    mockQuery: mQuery,
    mockClient: mClient,
    mockPool: {
      query: mQuery,
      connect: vi.fn().mockResolvedValue(mClient)
    }
  };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
}));

describe('CompatibilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('getAll', () => {
    it('should fetch all without category', async () => {
      await compatibilityService.getAll();
      expect(mocks.mockQuery).toHaveBeenCalledWith(expect.not.stringContaining('WHERE category'), []);
    });

    it('should fetch filtered by category', async () => {
      await compatibilityService.getAll('Screen');
      expect(mocks.mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE category = $1'), ['Screen']);
    });
  });

  describe('search', () => {
    it('should search with searchTerm and category', async () => {
      await compatibilityService.search('iPhone', 'Case');
      expect(mocks.mockQuery).toHaveBeenCalledWith(expect.stringContaining('model ILIKE $1'), ['%iPhone%', 'Case']);
    });
  });

  describe('create', () => {
    it('should insert compatibility', async () => {
      const data = { brand: 'A', model: 'M', compatible_models: ['X'], category: 'C' };
      mocks.mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, ...data }] });

      const res = await compatibilityService.create(data);

      expect(res.id).toBe(1);
      expect(mocks.mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO'), expect.any(Array));
    });
  });

  describe('bulkCreate', () => {
    it('should use transaction for bulk insert', async () => {
      const items = [
        { brand: 'A', model: 'M1', compatible_models: [], category: 'C' },
        { brand: 'A', model: 'M2', compatible_models: [], category: 'C' }
      ];

      await compatibilityService.bulkCreate(items);

      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mocks.mockClient.query).toHaveBeenCalledTimes(4); // BEGIN, INSERT, INSERT, COMMIT
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      mocks.mockClient.query.mockResolvedValueOnce({}); // BEGIN
      mocks.mockClient.query.mockRejectedValueOnce(new Error('Fail'));

      await expect(compatibilityService.bulkCreate([{ brand: 'A', model: 'M', compatible_models: [], category: 'C' }])).rejects.toThrow();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
