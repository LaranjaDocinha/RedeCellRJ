import pool from '../db/index.js';
import { logger } from '../utils/logger.js';
import { getContext } from '../utils/context.js';

export const auditService = {
  /**
   * Registra uma alteração de estoque no histórico.
   */
  async logStockChange({
    productVariationId,
    branchId,
    oldQuantity,
    newQuantity,
    reason,
    referenceId,
    client,
  }: {
    productVariationId: number;
    branchId: number;
    oldQuantity: number;
    newQuantity: number;
    reason: string;
    referenceId?: string;
    client?: any;
  }) {
    const db = client || pool;
    const ctx = getContext();
    const userId = ctx?.userId;

    try {
      await db.query(
        `INSERT INTO stock_history (product_variation_id, branch_id, old_quantity, new_quantity, reason, reference_id, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [productVariationId, branchId, oldQuantity, newQuantity, reason, referenceId, userId],
      );
    } catch (error) {
      logger.error({ error, productVariationId }, 'Failed to log stock change to history');
    }
  },

  /**
   * Registra um snapshot do produto no histórico.
   */
  async logProductChange(
    productId: number,
    changeType: 'INSERT' | 'UPDATE' | 'DELETE',
    snapshot: any,
    client?: any,
  ) {
    const db = client || pool;
    const ctx = getContext();
    const userId = ctx?.userId;

    try {
      await db.query(
        `INSERT INTO products_history (product_id, name, sku, is_serialized, change_type, snapshot, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          productId,
          snapshot.name,
          snapshot.sku,
          snapshot.is_serialized,
          changeType,
          JSON.stringify(snapshot),
          userId,
        ],
      );
    } catch (error) {
      logger.error({ error, productId }, 'Failed to log product change to history');
    }
  },

  async logAction(userId: string, action: string, entity: string, details: any) {
    try {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
        [userId, action, entity, JSON.stringify(details)],
      );
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  },
};
