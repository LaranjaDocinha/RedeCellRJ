import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stockPredictionService } from '../../../src/services/stockPredictionService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('StockPredictionService', () => {
  let mockQuery: vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = vi.mocked(pool.query);
  });

  describe('predictStockNeeds', () => {
    it('should predict stock needs based on historical data', async () => {
      // Mock historical sales data (product variations)
      mockQuery.mockResolvedValueOnce({
        rows: [
          { item_id: 1, item_type: 'product_variation', total_sold_quantity: '90' }, // 1 per day for 90 days
        ],
      });

      // Mock historical repair data (parts)
      mockQuery.mockResolvedValueOnce({
        rows: [
          { item_id: 10, item_type: 'part', total_repaired_quantity: '45' }, // 0.5 per day for 90 days
        ],
      });

      // Mock all product variations
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 1, product_id: 100, stock_quantity: 20, low_stock_threshold: 5 }, // Stock 20. Demand 30 days = 30. Remaining = -10 < 5. ALERT
          { id: 2, product_id: 101, stock_quantity: 100, low_stock_threshold: 5 }, // No history. Demand 0. Remaining 100 > 5. NO ALERT
        ],
      });

      // Mock all parts
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 10, name: 'Screen', stock_quantity: 10, low_stock_threshold: 2 }, // Stock 10. Demand 30 days = 15. Remaining = -5 < 2. ALERT
          { id: 11, name: 'Battery', stock_quantity: 50, low_stock_threshold: 5 }, // No history. Demand 0. Remaining 50 > 5. NO ALERT
        ],
      });

      const predictions = await stockPredictionService.predictStockNeeds(90, 30);

      expect(predictions).toHaveLength(2); // One variation and one part

      // Check product variation prediction
      const variationPrediction = predictions.find((p) => p.item_type === 'product_variation');
      expect(variationPrediction).toBeDefined();
      expect(variationPrediction.item_id).toBe(1);
      expect(variationPrediction.predicted_demand_quantity).toBe(30); // 90 sold / 90 days * 30 prediction days
      expect(variationPrediction.remaining_stock_after_prediction).toBe(-10);

      // Check part prediction
      const partPrediction = predictions.find((p) => p.item_type === 'part');
      expect(partPrediction).toBeDefined();
      expect(partPrediction.item_id).toBe(10);
      expect(partPrediction.predicted_demand_quantity).toBe(15); // 45 used / 90 days * 30 prediction days
      expect(partPrediction.remaining_stock_after_prediction).toBe(-5);
    });

    it('should handle zero historical demand correctly', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Sales
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Repairs

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, product_id: 100, stock_quantity: 10, low_stock_threshold: 5 }],
      });

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 10, name: 'Screen', stock_quantity: 10, low_stock_threshold: 5 }],
      });

      const predictions = await stockPredictionService.predictStockNeeds();

      expect(predictions).toHaveLength(0); // Stock (10) > Threshold (5) with 0 demand
    });

    it('should alert if stock is already below threshold even with zero demand', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Sales
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Repairs

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, product_id: 100, stock_quantity: 2, low_stock_threshold: 5 }],
      });

      mockQuery.mockResolvedValueOnce({ rows: [] }); // Parts

      const predictions = await stockPredictionService.predictStockNeeds();

      expect(predictions).toHaveLength(1);
      expect(predictions[0].item_id).toBe(1);
      expect(predictions[0].remaining_stock_after_prediction).toBe(2);
    });
  });
});
