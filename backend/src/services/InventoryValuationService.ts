import pool from '../db/index.js';
import { settingsService } from './settingsService.js';

class InventoryValuationService {
  async getVariationCost(variationId: number): Promise<number> {
    // For now, we'll use average cost. FIFO would be more complex here.
    const query = `
      SELECT SUM(im.unit_cost * im.quantity_change) / SUM(im.quantity_change) as avg_cost
      FROM inventory_movements im
      WHERE im.product_variation_id = $1 AND im.quantity_change > 0 AND im.unit_cost IS NOT NULL;
    `;
    const result = await pool.query(query, [variationId]);
    // If there are no purchase records, we can't determine a cost. Defaulting to 0.
    return parseFloat(result.rows[0]?.avg_cost || 0);
  }

  /**
   * Calculates the total value of the current inventory based on the configured valuation method.
   * @returns {Promise<number>} The total value of the inventory.
   */
  async calculateInventoryValue(): Promise<number> {
    const setting = await settingsService.getSettingByKey('inventory_valuation_method');
    const method = setting?.value;

    if (method === 'fifo') {
      return this.calculateFIFO();
    } else {
      // Default to average_cost
      return this.calculateAverageCost();
    }
  }

  /**
   * Calculates inventory value using the Weighted Average Cost method.
   * This is simpler as it doesn't require tracking individual batches.
   * @returns {Promise<number>} The total inventory value.
   */
  private async calculateAverageCost(): Promise<number> {
    const query = `
      WITH current_stock AS (
        -- Get the current stock for each variation
        SELECT id as variation_id, stock_quantity
        FROM product_variations
        WHERE stock_quantity > 0
      ),
      average_cost AS (
        -- Calculate the weighted average cost for each variation from all stock-in movements
        SELECT
          im.product_variation_id,
          SUM(im.unit_cost * im.quantity_change) / SUM(im.quantity_change) as avg_cost
        FROM inventory_movements im
        WHERE im.quantity_change > 0 AND im.unit_cost IS NOT NULL
        GROUP BY im.product_variation_id
      )
      -- Calculate the final value for each variation and sum them up
      SELECT SUM(cs.stock_quantity * ac.avg_cost) as total_value
      FROM current_stock cs
      JOIN average_cost ac ON cs.variation_id = ac.product_variation_id;
    `;

    const result = await pool.query(query);
    return parseFloat(result.rows[0]?.total_value || 0);
  }

  /**
   * Calculates inventory value using the FIFO (First-In, First-Out) method.
   * This is more complex as it requires processing historical purchases.
   * @returns {Promise<number>} The total inventory value.
   */
  private async calculateFIFO(): Promise<number> {
    // This is a complex query. It needs to get the current stock of each item,
    // then look backwards at the stock-in movements (inventory_movements with quantity > 0)
    // and match the current stock quantity with the most recent purchases.

    // For each product variation with stock > 0
    //  1. Get current stock (e.g., 15 units)
    //  2. Get all positive inventory movements with quantity_remaining > 0, ordered by date ASC.
    //  3. Iterate through the movements, subtracting from the current stock until it's zero.
    //     - Movement 1 (cost $10): 8 units remaining. Current stock becomes 7. Value += 8 * $10.
    //     - Movement 2 (cost $12): 10 units remaining. Current stock becomes 0. Value += 7 * $12.

    // This logic is best implemented in the application layer rather than a single giant SQL query
    // for clarity and maintainability.

    const stockVariations = await pool.query(
      'SELECT id, stock_quantity FROM product_variations WHERE stock_quantity > 0',
    );
    let totalInventoryValue = 0;

    for (const variation of stockVariations.rows) {
      let stockToValue = variation.stock_quantity;
      const purchaseLayers = await pool.query(
        `SELECT unit_cost, quantity_remaining
         FROM inventory_movements
         WHERE product_variation_id = $1
           AND quantity_change > 0
           AND quantity_remaining > 0
         ORDER BY created_at ASC`,
        [variation.id],
      );

      for (const layer of purchaseLayers.rows) {
        if (stockToValue <= 0) break;

        const cost = parseFloat(layer.unit_cost);
        const available = layer.quantity_remaining;

        const quantityToTake = Math.min(stockToValue, available);
        totalInventoryValue += quantityToTake * cost;
        stockToValue -= quantityToTake;
      }
    }

    return totalInventoryValue;
  }
}

export const inventoryValuationService = new InventoryValuationService();
