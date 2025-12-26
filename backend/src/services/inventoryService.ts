import { AppError } from '../utils/errors.js';
import pool, { getPool } from '../db/index.js';
import { PoolClient } from 'pg';
import { demandPredictionService } from './demandPredictionService.js';

const NOTIFICATIONS_MICROSERVICE_URL =
  process.env.NOTIFICATIONS_MICROSERVICE_URL || 'http://localhost:3002';

export const inventoryService = {
  async getLowStockProducts(threshold: number = 10) {
    const { rows } = await pool.query(
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
  },

  async adjustStock(
    variationId: number,
    quantityChange: number,
    reason: string,
    userId?: string,
    dbClient?: PoolClient,
    unitCost?: number,
    branchId?: number,
  ) {
    const client = dbClient || (await pool.connect());
    const shouldManageTransaction = !dbClient;

    try {
      if (shouldManageTransaction) await client.query('BEGIN');

      const {
        rows: [stockInfo],
      } = await client.query(
        `SELECT ps.quantity as stock_quantity, pv.low_stock_threshold, pv.product_id
         FROM product_stock ps
         JOIN product_variations pv ON ps.product_variation_id = pv.id
         WHERE ps.product_variation_id = $1 AND ps.branch_id = $2 FOR UPDATE`,
        [variationId, branchId || 1],
      );

      if (!stockInfo) {
        throw new AppError('Product variation stock not found for this branch.', 404);
      }

      const newStock = stockInfo.stock_quantity + quantityChange;
      if (newStock < 0) {
        throw new AppError('Stock quantity cannot be negative.', 400);
      }

      if (quantityChange > 0 && unitCost === undefined) {
        if (reason === 'stock_received' && unitCost === undefined) {
            throw new AppError('Unit cost is required when receiving stock.', 400);
        }
      }

      const {
        rows: [updatedStock],
      } = await client.query(
        'UPDATE product_stock SET quantity = $1 WHERE product_variation_id = $2 AND branch_id = $3 RETURNING *',
        [newStock, variationId, branchId || 1],
      );

      await client.query(
        'INSERT INTO inventory_movements (product_variation_id, branch_id, quantity_change, reason, user_id, unit_cost, quantity_remaining) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          variationId,
          branchId || 1,
          quantityChange,
          reason,
          userId,
          unitCost,
          quantityChange > 0 ? quantityChange : null,
        ],
      );

      if (quantityChange < 0) {
        let stockToRemove = Math.abs(quantityChange);
        const purchaseLayers = await client.query(
          `SELECT id, quantity_remaining
           FROM inventory_movements
           WHERE product_variation_id = $1 AND quantity_change > 0 AND quantity_remaining > 0 AND branch_id = $2
           ORDER BY created_at ASC`,
          [variationId, branchId || 1],
        );

        for (const layer of purchaseLayers.rows) {
          if (stockToRemove <= 0) break;
          const available = layer.quantity_remaining;
          const toRemoveFromLayer = Math.min(stockToRemove, available);
          await client.query(
            'UPDATE inventory_movements SET quantity_remaining = quantity_remaining - $1 WHERE id = $2',
            [toRemoveFromLayer, layer.id],
          );
          stockToRemove -= toRemoveFromLayer;
        }

        if (stockToRemove > 0) {
          throw new AppError('Not enough stock layers to fulfill the order.', 500);
        }
      }

      if (updatedStock.quantity <= stockInfo.low_stock_threshold) {
        await fetch(`${NOTIFICATIONS_MICROSERVICE_URL}/send/in-app`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Estoque baixo para o produto ${stockInfo.product_id}.`,
            type: 'low_stock_alert',
            productId: stockInfo.product_id,
            variationId: variationId,
            currentStock: updatedStock.quantity,
            threshold: stockInfo.low_stock_threshold,
          }),
        }).catch(() => console.warn('Notification microservice unreachable'));
      }

      if (shouldManageTransaction) await client.query('COMMIT');
      return updatedStock;
    } catch (error: unknown) {
      if (shouldManageTransaction) await client.query('ROLLBACK');
      throw error;
    } finally {
      if (shouldManageTransaction) client.release();
    }
  },

  async receiveStock(variationId: number, quantity: number, unitCost: number, userId?: string, dbClient?: PoolClient) {
    return this.adjustStock(variationId, quantity, 'stock_received', userId, dbClient, unitCost);
  },

  async dispatchStock(variationId: number, quantity: number, userId?: string, dbClient?: PoolClient) {
    return this.adjustStock(variationId, -quantity, 'stock_dispatched', userId, dbClient);
  },

  async getInventoryDiscrepancies(branchId: number): Promise<any[]> {
    const pool = getPool();
    const result = await pool.query(
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
      [branchId]
    );
    return result.rows;
  },

  async suggestPurchaseOrders(branchId: number): Promise<any[]> {
    const { rows: products } = await pool.query(`
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
    `, [branchId]);

    const suggestions: any[] = [];
    for (const product of products) {
      const predictedDemand = await demandPredictionService.predictDemand(product.product_id, 3);
      const leadTimeDemand = predictedDemand * ((product.lead_time_days || 7) / 30);
      let suggestedQuantity = Math.ceil(predictedDemand + leadTimeDemand - product.current_stock);

      if (suggestedQuantity > 0) {
        suggestions.push({
          productId: product.product_id,
          productName: product.product_name,
          variationId: product.variation_id,
          variationColor: product.variation_color,
          currentStock: product.current_stock,
          predictedDemand,
          suggestedQuantity,
          reason: 'Previsão de Demanda e Estoque Baixo',
        });
      }
    }
    return suggestions;
  },
};
