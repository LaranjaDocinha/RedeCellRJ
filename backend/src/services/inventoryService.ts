import { AppError } from '../utils/errors.js';
import pool from '../db/index.js';
import { notificationEmitter } from '../utils/notificationEmitter.js'; // Import notificationEmitter

export const inventoryService = {
  async getLowStockProducts(threshold: number = 10) {
    const { rows } = await pool.query(
      `SELECT
        pv.id as variation_id,
        p.name as product_name,
        pv.color,
        pv.stock_quantity,
        pv.price,
        pv.low_stock_threshold
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.stock_quantity <= pv.low_stock_threshold
      ORDER BY pv.stock_quantity ASC, p.name ASC`,
    );
    return rows;
  },

  async adjustStock(variationId: number, quantityChange: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current stock
      const { rows: [variation] } = await client.query(
        'SELECT stock_quantity, low_stock_threshold FROM product_variations WHERE id = $1 FOR UPDATE',
        [variationId]
      );

      if (!variation) {
        throw new Error('Product variation not found.');
      }

      const newStock = variation.stock_quantity + quantityChange;
      if (newStock < 0) {
        throw new Error('Stock quantity cannot be negative.');
      }

      // Update stock
      const { rows: [updatedVariation] } = await client.query(
        'UPDATE product_variations SET stock_quantity = $1 WHERE id = $2 RETURNING *',
        [newStock, variationId]
      );

      // Check for low stock after update
      if (updatedVariation.stock_quantity <= updatedVariation.low_stock_threshold) {
        notificationEmitter.emitLowStock(updatedVariation.product_id, updatedVariation.id, updatedVariation.stock_quantity, updatedVariation.low_stock_threshold); // Emit notification
      }

      await client.query('COMMIT');
      return updatedVariation;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async receiveStock(variationId: number, quantity: number) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive to receive stock.');
    }
    return this.adjustStock(variationId, quantity);
  },

  async dispatchStock(variationId: number, quantity: number) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive to dispatch stock.');
    }
    return this.adjustStock(variationId, -quantity);
  },
};
