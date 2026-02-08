import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assetService } from '../../../src/services/assetService';
import * as dbModule from '../../../src/db/index';

// Mock getPool
const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('AssetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCurrentValue', () => {
    it('should calculate correctly for straight_line method', () => {
      // 1000 initial, 10 years life, 5 years passed = 500
      const acquisitionDate = new Date();
      acquisitionDate.setFullYear(acquisitionDate.getFullYear() - 5);

      const val = assetService.calculateCurrentValue(
        1000,
        acquisitionDate.toISOString(),
        'straight_line',
        10,
      );
      expect(val).toBeCloseTo(500, -1); // Allow small diff due to leap years
    });

    it('should return 0 if useful life exceeded', () => {
      const acquisitionDate = new Date();
      acquisitionDate.setFullYear(acquisitionDate.getFullYear() - 11);

      const val = assetService.calculateCurrentValue(
        1000,
        acquisitionDate.toISOString(),
        'straight_line',
        10,
      );
      expect(val).toBe(0);
    });
  });

  describe('createAsset', () => {
    it('should insert asset', async () => {
      const mockAsset = { id: 1 };
      mockQuery.mockResolvedValue({ rows: [mockAsset] });

      const payload = {
        name: 'Laptop',
        acquisition_date: new Date().toISOString(),
        initial_value: 1000,
        depreciation_method: 'straight_line' as const,
        useful_life_years: 5,
      };

      const result = await assetService.createAsset(payload);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO assets'),
        expect.any(Array),
      );
      expect(result).toEqual(mockAsset);
    });
  });

  describe('getAssetById', () => {
    it('should return asset', async () => {
      const mockAsset = { id: 1 };
      mockQuery.mockResolvedValue({ rows: [mockAsset] });
      const result = await assetService.getAssetById(1);
      expect(result).toEqual(mockAsset);
    });
  });

  describe('getAllAssets', () => {
    it('should return all assets', async () => {
      const mockAssets = [{ id: 1 }];
      mockQuery.mockResolvedValue({ rows: mockAssets });
      const result = await assetService.getAllAssets();
      expect(result).toEqual(mockAssets);
    });
  });

  describe('updateAsset', () => {
    it('should update asset', async () => {
      const mockAsset = {
        id: 1,
        initial_value: 1000,
        acquisition_date: new Date().toISOString(),
        depreciation_method: 'straight_line',
        useful_life_years: 5,
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockAsset] }); // getById
      mockQuery.mockResolvedValueOnce({ rows: [{ ...mockAsset, name: 'New Name' }] }); // update

      const result = await assetService.updateAsset(1, { name: 'New Name' });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE assets SET name = $1'),
        expect.any(Array),
      );
      expect(result).toEqual({ ...mockAsset, name: 'New Name' });
    });

    it('should return undefined if asset not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] }); // getById returns nothing
      const result = await assetService.updateAsset(1, { name: 'N' });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });
      const result = await assetService.deleteAsset(1);
      expect(result).toBe(true);
    });
  });
});
