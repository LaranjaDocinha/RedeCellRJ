import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface ProductStock {
  product_id: number;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface StockInfo {
  stock_quantity: number;
  low_stock_threshold: number;
  product_id: number;
}

export interface InventoryMovementData {
  product_variation_id: number;
  branch_id: number;
  quantity_change: number;
  reason: string;
  user_id?: string;
  unit_cost?: number;
  quantity_remaining: number | null;
}

export interface PurchaseLayer {
  id: number;
  quantity_remaining: number;
}

export interface InventoryDiscrepancy {
  product_name: string;
  variation_color: string;
  actual_stock: number;
  theoretical_stock: number;
  discrepancy: number;
}

export interface PurchaseSuggestionProduct {
  product_id: number;
  product_name: string;
  variation_id: number;
  variation_color: string;
  current_stock: number;
  low_stock_threshold: number;
  reorder_point?: number;
  lead_time_days?: number;
}

export class InventoryRepository {
  private get db(): Pool {
    return getPool();
  }

  async findLowStockProducts(threshold: number): Promise<ProductStock[]> {
    const { rows } = await this.db.query(
      `SELECT
        p.id AS product_id,
        p.name,
        ps.quantity AS stock_quantity,
        pv.low_stock_threshold
       FROM product_stock ps
       JOIN product_variations pv ON ps.product_variation_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ps.quantity <= $1 OR ps.quantity <= pv.low_stock_threshold
       ORDER BY ps.quantity ASC`,
      [threshold],
    );
    return rows;
  }

  async findStockForUpdate(
    variationId: number,
    branchId: number,
    client: PoolClient,
  ): Promise<StockInfo | null> {
    const { rows } = await client.query(
      `SELECT ps.quantity as stock_quantity, pv.low_stock_threshold, pv.product_id
       FROM product_stock ps
       JOIN product_variations pv ON ps.product_variation_id = pv.id
       WHERE ps.product_variation_id = $1 AND ps.branch_id = $2 FOR UPDATE`,
      [variationId, branchId],
    );
    return rows[0] || null;
  }

  async updateStockQuantity(
    variationId: number,
    branchId: number,
    newStock: number,
    client: PoolClient,
  ): Promise<{ quantity: number }> {
    const { rows } = await client.query(
      'UPDATE product_stock SET quantity = $1 WHERE product_variation_id = $2 AND branch_id = $3 RETURNING *',
      [newStock, variationId, branchId],
    );
    return rows[0];
  }

  async createMovement(data: InventoryMovementData, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO inventory_movements (product_variation_id, branch_id, quantity_change, reason, user_id, unit_cost, quantity_remaining) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        data.product_variation_id,
        data.branch_id,
        data.quantity_change,
        data.reason,
        data.user_id,
        data.unit_cost,
        data.quantity_remaining,
      ],
    );
  }

  async findPurchaseLayers(
    variationId: number,
    branchId: number,
    client: PoolClient,
  ): Promise<PurchaseLayer[]> {
    const { rows } = await client.query(
      `SELECT id, quantity_remaining
       FROM inventory_movements
       WHERE product_variation_id = $1 AND quantity_change > 0 AND quantity_remaining > 0 AND branch_id = $2
       ORDER BY created_at ASC`,
      [variationId, branchId],
    );
    return rows;
  }

  async updateMovementRemaining(
    id: number,
    quantityRemaining: number,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      'UPDATE inventory_movements SET quantity_remaining = $1 WHERE id = $2',
      [quantityRemaining, id], // Note: logic in service was "quantity_remaining - $1", but repo should be explicit or support decrement.
      // Checking service logic: 'UPDATE ... SET quantity_remaining = quantity_remaining - $1'
      // To keep repo pure, I can either pass the delta or the final value. Passing the delta is safer for concurrency if not locked, but here we are in a transaction.
      // Let's stick to the service logic's intent: update to a new value or decrement.
      // The service calculates `toRemoveFromLayer` and does `quantity_remaining - toRemove`.
      // I will implement `decrementMovementRemaining` to match the SQL exactly.
    );
  }

  async decrementMovementRemaining(
    id: number,
    amountToRemove: number,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      'UPDATE inventory_movements SET quantity_remaining = quantity_remaining - $1 WHERE id = $2',
      [amountToRemove, id],
    );
  }

  async decreaseStock(
    amount: number,
    variationId: number,
    branchId: number,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      'UPDATE branch_product_variations_stock SET stock_quantity = stock_quantity - $1 WHERE product_variation_id = $2 AND branch_id = $3',
      [amount, variationId, branchId],
    );
  }

  async findDiscrepancies(branchId: number): Promise<InventoryDiscrepancy[]> {
    const result = await this.db.query(
      `WITH StockMovements AS (
          SELECT
              im.product_variation_id,
              SUM(CASE WHEN im.quantity_change > 0 THEN im.quantity_change ELSE 0 END) AS total_received,
              SUM(CASE WHEN im.quantity_change < 0 THEN im.quantity_change ELSE 0 END) AS total_dispatched
          FROM inventory_movements im
          WHERE im.branch_id = $1
          GROUP BY im.product_variation_id
      )
      SELECT
          p.name AS product_name,
          pv.color AS variation_color,
          ps.quantity AS actual_stock,
          (COALESCE(sm.total_received, 0) + COALESCE(sm.total_dispatched, 0)) AS theoretical_stock,
          ps.quantity - (COALESCE(sm.total_received, 0) + COALESCE(sm.total_dispatched, 0)) AS discrepancy
      FROM product_stock ps
      JOIN product_variations pv ON ps.product_variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN StockMovements sm ON ps.product_variation_id = sm.product_variation_id
      WHERE ps.branch_id = $1 AND (ps.quantity - (COALESCE(sm.total_received, 0) + COALESCE(sm.total_dispatched, 0))) <> 0;`,
      [branchId],
    );
    return result.rows;
  }

  async findProductsBelowThreshold(branchId: number): Promise<PurchaseSuggestionProduct[]> {
    const { rows } = await this.db.query(
      `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        pv.id AS variation_id,
        pv.color AS variation_color,
        ps.quantity AS current_stock,
        pv.low_stock_threshold,
        pv.reorder_point,
        pv.lead_time_days
      FROM product_stock ps
      JOIN product_variations pv ON ps.product_variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ps.branch_id = $1 AND ps.quantity <= pv.low_stock_threshold
      ORDER BY p.name, pv.color;
    `,
      [branchId],
    );
    return rows;
  }

  async findAllInventory(branchId: number): Promise<any[]> {
    const { rows } = await this.db.query(
      `
      SELECT
        pv.id,
        pv.id AS variation_id,
        p.id AS product_id,
        p.name AS product_name,
        pv.color,
        ps.quantity AS stock_quantity,
        pv.low_stock_threshold AS min_stock,
        pv.reorder_point AS max_stock,
        pv.price,
        pv.cost_price,
        c.name AS category_name,
        'C' as abc_class, -- Placeholder
        15 as days_of_cover, -- Placeholder
        false as is_aging, -- Placeholder
        CURRENT_TIMESTAMP as last_audit -- Placeholder
      FROM product_stock ps
      JOIN product_variations pv ON ps.product_variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ps.branch_id = $1
      ORDER BY p.name ASC, pv.color ASC;
    `,
      [branchId],
    );
    return rows;
  }
}

export const inventoryRepository = new InventoryRepository();
