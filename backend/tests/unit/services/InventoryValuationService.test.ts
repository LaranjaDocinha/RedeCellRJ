import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryValuationService } from '../../../src/services/InventoryValuationService';
import pool from '../../../src/db/index';
import { settingsService } from '../../../src/services/settingsService';

vi.mock('../../../src/db/index', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('../../../src/services/settingsService', () => ({
  settingsService: {
    getSettingByKey: vi.fn(),
  },
}));

describe('InventoryValuationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVariationCost', () => {
    it('should calculate average cost', async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ avg_cost: '10.5' }] });
      const result = await inventoryValuationService.getVariationCost(1);
      expect(result).toBe(10.5);
    });

    it('should default to 0', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });
      const result = await inventoryValuationService.getVariationCost(1);
      expect(result).toBe(0);
    });
  });

  describe('calculateInventoryValue', () => {
    it('should calculate using average_cost (default)', async () => {
      (settingsService.getSettingByKey as any).mockResolvedValue({ value: 'average_cost' });
      (pool.query as any).mockResolvedValue({ rows: [{ total_value: '1000' }] });

      const result = await inventoryValuationService.calculateInventoryValue();
      expect(result).toBe(1000);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WITH current_stock AS'));
    });

    it('should calculate using fifo', async () => {
      (settingsService.getSettingByKey as any).mockResolvedValue({ value: 'fifo' });
      
      // Mock stock variations
      (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 1, stock_quantity: 5 }] });
      
      // Mock purchase layers for var 1
      // 5 items in stock.
      // Layer 1: cost 10, remaining 3. (Take 3)
      // Layer 2: cost 20, remaining 5. (Take 2)
      // Total = 3*10 + 2*20 = 30 + 40 = 70.
      (pool.query as any).mockResolvedValueOnce({ 
        rows: [
          { unit_cost: '10', quantity_remaining: 3 },
          { unit_cost: '20', quantity_remaining: 5 }
        ] 
      });

      const result = await inventoryValuationService.calculateInventoryValue();
      expect(result).toBe(70);
    });
  });
});
