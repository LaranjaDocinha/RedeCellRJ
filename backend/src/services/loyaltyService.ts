import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  description?: string;
  benefits?: any; // JSONB
  created_at: Date;
  updated_at: Date;
}

interface CreateLoyaltyTierPayload {
  name: string;
  min_points: number;
  description?: string;
  benefits?: any;
}

interface UpdateLoyaltyTierPayload {
  name?: string;
  min_points?: number;
  description?: string;
  benefits?: any;
}

export const loyaltyService = {
  async getLoyaltyPoints(userId: number) {
    const { rows } = await pool.query('SELECT loyalty_points FROM users WHERE id = $1', [userId]);
    return rows[0] ? rows[0].loyalty_points : 0;
  },

  async addLoyaltyPoints(userId: number, points: number, reason: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update user's points
      const { rows: [user] } = await client.query(
        'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2 RETURNING loyalty_points',
        [points, userId]
      );

      if (!user) {
        throw new AppError('User not found.', 404);
      }

      // Log transaction
      await client.query(
        'INSERT INTO loyalty_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)',
        [userId, points, reason]
      );

      await client.query('COMMIT');
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

  async redeemLoyaltyPoints(userId: number, points: number, reason: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user has enough points
      const { rows: [user] } = await client.query('SELECT loyalty_points FROM users WHERE id = $1 FOR UPDATE', [userId]);
      if (!user || user.loyalty_points < points) {
        throw new AppError('Insufficient loyalty points.', 400);
      }

      // Deduct points
      const { rows: [updatedUser] } = await client.query(
        'UPDATE users SET loyalty_points = loyalty_points - $1 WHERE id = $2 RETURNING loyalty_points',
        [points, userId]
      );

      // Log transaction
      await client.query(
        'INSERT INTO loyalty_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)',
        [userId, -points, reason]
      );

      await client.query('COMMIT');
      return updatedUser.loyalty_points;
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

  async getLoyaltyTransactions(userId: number) {
    const { rows } = await pool.query(
      'SELECT points_change, reason, created_at FROM loyalty_transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  // Loyalty Tier Management
  async getAllLoyaltyTiers(): Promise<LoyaltyTier[]> {
    const result = await pool.query('SELECT * FROM loyalty_tiers ORDER BY min_points ASC');
    return result.rows;
  },

  async getLoyaltyTierById(id: number): Promise<LoyaltyTier | undefined> {
    const result = await pool.query('SELECT * FROM loyalty_tiers WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createLoyaltyTier(payload: CreateLoyaltyTierPayload): Promise<LoyaltyTier> {
    const { name, min_points, description, benefits } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO loyalty_tiers (name, min_points, description, benefits) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, min_points, description, benefits]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Loyalty tier with this name or min_points already exists', 409);
      }
      throw error;
    }
  },

  async updateLoyaltyTier(id: number, payload: UpdateLoyaltyTierPayload): Promise<LoyaltyTier | undefined> {
    const { name, min_points, description, benefits } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = ${paramIndex++}`); values.push(name); }
    if (min_points !== undefined) { fields.push(`min_points = ${paramIndex++}`); values.push(min_points); }
    if (description !== undefined) { fields.push(`description = ${paramIndex++}`); values.push(description); }
    if (benefits !== undefined) { fields.push(`benefits = ${paramIndex++}`); values.push(benefits); }

    if (fields.length === 0) {
      const existingTier = await this.getLoyaltyTierById(id);
      if (!existingTier) {
        return undefined; // No tier found to update
      }
      return existingTier; // No fields to update, return existing tier
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE loyalty_tiers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = ${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Loyalty tier with this name or min_points already exists', 409);
      }
      throw error;
    }
  },

  async deleteLoyaltyTier(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM loyalty_tiers WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  },

  async getUserLoyaltyTier(userId: number): Promise<LoyaltyTier | undefined> {
    const userPoints = await this.getLoyaltyPoints(userId);
    const result = await pool.query(
      'SELECT * FROM loyalty_tiers WHERE min_points <= $1 ORDER BY min_points DESC LIMIT 1',
      [userPoints]
    );
    return result.rows[0];
  },
};
