import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface LoyaltyTransaction {
  customer_id: number;
  points: number;
  type: 'earned' | 'redeemed';
  reason: string;
}

export class LoyaltyRepository {
  private get db(): Pool {
    return getPool();
  }

  async getPoints(customerId: number, client?: PoolClient): Promise<number | null> {
    const executor = client || this.db;
    const { rows } = await executor.query('SELECT loyalty_points FROM customers WHERE id = $1', [
      customerId,
    ]);
    if (rows.length === 0) return null;
    return rows[0].loyalty_points;
  }

  async getPointsForUpdate(customerId: number, client: PoolClient): Promise<number | null> {
    const { rows } = await client.query(
      'SELECT loyalty_points FROM customers WHERE id = $1 FOR UPDATE',
      [customerId],
    );
    if (rows.length === 0) return null;
    return rows[0].loyalty_points;
  }

  async updatePoints(
    customerId: number,
    pointsChange: number,
    client: PoolClient,
  ): Promise<number> {
    const { rows } = await client.query(
      'UPDATE customers SET loyalty_points = loyalty_points + $1 WHERE id = $2 RETURNING loyalty_points',
      [pointsChange, customerId],
    );
    return rows[0].loyalty_points;
  }

  async createTransaction(data: LoyaltyTransaction, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO loyalty_transactions (customer_id, points, type, reason) VALUES ($1, $2, $3, $4)',
      [data.customer_id, data.points, data.type, data.reason],
    );
  }
}

export const loyaltyRepository = new LoyaltyRepository();
