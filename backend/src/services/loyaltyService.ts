import pool from '../db/index.js';
import { getPool } from '../db/index.js'; // Keep getPool for legacy tier methods if needed, or replace with pool.query
import { AppError } from '../utils/errors.js';
import { loyaltyRepository } from '../repositories/loyalty.repository.js';

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
  async getLoyaltyPoints(customerId: number) {
    const points = await loyaltyRepository.getPoints(customerId);
    if (points === null) {
      throw new AppError('Customer not found', 404);
    }
    return points;
  },

  async addLoyaltyPoints(customerId: number, points: number, reason: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update customer's points
      // Check if customer exists first or rely on update returning row? Repo logic: update returns new points.
      // If customer doesn't exist, update returns empty/error? Repo assumes valid ID or returns null if not found logic is needed.
      // Let's assume repo updatePoints throws or returns null if not found.
      // Actually, my repo implementation returns rows[0].loyalty_points. If no row, it throws (undefined access).
      // Let's use check first for safety or try/catch.
      // Better: check existence.

      const currentPoints = await loyaltyRepository.getPoints(customerId, client);
      if (currentPoints === null) throw new AppError('Customer not found.', 404);

      const newPoints = await loyaltyRepository.updatePoints(customerId, points, client);

      // Log transaction
      await loyaltyRepository.createTransaction(
        {
          customer_id: customerId,
          points: points,
          type: points > 0 ? 'earned' : 'redeemed',
          reason: reason,
        },
        client,
      );

      await client.query('COMMIT');
      return newPoints;
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

  async redeemLoyaltyPoints(customerId: number, points: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const currentPoints = await loyaltyRepository.getPointsForUpdate(customerId, client);

      if (currentPoints === null) {
        throw new AppError('Customer not found.', 404);
      }

      if (currentPoints < points) {
        throw new AppError('Insufficient loyalty points.', 400);
      }

      await loyaltyRepository.updatePoints(customerId, -points, client);

      await loyaltyRepository.createTransaction(
        {
          customer_id: customerId,
          points: -points,
          type: 'redeemed',
          reason: 'Redeemed loyalty points',
        },
        client,
      );

      await client.query('COMMIT');
      return { success: true, message: 'Loyalty points redeemed successfully.' };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Database error', 500);
    } finally {
      client.release();
    }
  },

  async getLoyaltyTransactions(customerId: number) {
    const customerCheck = await getPool().query('SELECT id FROM customers WHERE id = $1', [
      customerId,
    ]);

    if (customerCheck.rows.length === 0) {
      throw new AppError(`Cliente com ID ${customerId} não encontrado.`, 404);
    }

    const { rows } = await getPool().query(
      'SELECT points as points_change, reason, created_at, type as action_type FROM loyalty_transactions WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId],
    );

    return rows;
  },

  async getLoyaltySummary() {
    const query = `
      SELECT 
        c.id as customer_id,
        c.name,
        c.email,
        c.phone,
        c.loyalty_points,
        lt.name as tier_name,
        COALESCE(SUM(CASE WHEN tr.points > 0 THEN tr.points ELSE 0 END), 0) as total_earned,
        ABS(COALESCE(SUM(CASE WHEN tr.points < 0 THEN tr.points ELSE 0 END), 0)) as total_redeemed
      FROM customers c
      LEFT JOIN loyalty_tiers lt ON c.loyalty_points >= lt.min_points
      LEFT JOIN loyalty_transactions tr ON c.id = tr.customer_id
      GROUP BY c.id, lt.name, lt.min_points
      ORDER BY c.loyalty_points DESC, c.name ASC
    `;
    
    // Note: The logic above for tier_name might return multiple rows if not handled correctly with a window function or subquery to get the HIGHEST tier.
    // Let's refine the tier join to get only the highest tier for each customer.
    
    const refinedQuery = `
      WITH CustomerTiers AS (
        SELECT 
          c.id as customer_id,
          c.name,
          c.email,
          c.phone,
          c.loyalty_points,
          (SELECT name FROM loyalty_tiers WHERE min_points <= c.loyalty_points ORDER BY min_points DESC LIMIT 1) as tier_name
        FROM customers c
      )
      SELECT 
        ct.*,
        COALESCE(SUM(CASE WHEN tr.points > 0 THEN tr.points ELSE 0 END), 0) as total_earned,
        ABS(COALESCE(SUM(CASE WHEN tr.points < 0 THEN tr.points ELSE 0 END), 0)) as total_redeemed
      FROM CustomerTiers ct
      LEFT JOIN loyalty_transactions tr ON ct.customer_id = tr.customer_id
      GROUP BY ct.customer_id, ct.name, ct.email, ct.phone, ct.loyalty_points, ct.tier_name
      ORDER BY ct.loyalty_points DESC, ct.name ASC
    `;

    const result = await getPool().query(refinedQuery);
    return result.rows;
  },

  async getTransactionsByCustomerId(customerId: number) {
    const { rows } = await getPool().query(
      'SELECT id, customer_id, points as points_change, reason, created_at, type as action_type FROM loyalty_transactions WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId],
    );
    return rows;
  },

  // Loyalty Tier Management
  async getAllLoyaltyTiers(): Promise<LoyaltyTier[]> {
    const result = await getPool().query('SELECT * FROM loyalty_tiers ORDER BY min_points ASC');
    return result.rows;
  },

  async getLoyaltyTierById(id: number): Promise<LoyaltyTier | undefined> {
    const result = await getPool().query('SELECT * FROM loyalty_tiers WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createLoyaltyTier(payload: CreateLoyaltyTierPayload): Promise<LoyaltyTier> {
    const { name, min_points, description, benefits } = payload;
    try {
      const result = await getPool().query(
        'INSERT INTO loyalty_tiers (name, min_points, description, benefits) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, min_points, description, benefits],
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        // Unique violation error code
        throw new AppError('Loyalty tier with this name or min_points already exists', 409);
      }
      throw error;
    }
  },

  async updateLoyaltyTier(
    id: number,
    payload: UpdateLoyaltyTierPayload,
  ): Promise<LoyaltyTier | undefined> {
    const { name, min_points, description, benefits } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (min_points !== undefined) {
      fields.push(`min_points = $${paramIndex++}`);
      values.push(min_points);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (benefits !== undefined) {
      fields.push(`benefits = $${paramIndex++}`);
      values.push(benefits);
    }

    if (fields.length === 0) {
      const existingTier = await this.getLoyaltyTierById(id);
      if (!existingTier) {
        return undefined; // No tier found to update
      }
      return existingTier; // No fields to update, return existing tier
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE loyalty_tiers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await getPool().query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        // Unique violation error code
        throw new AppError('Loyalty tier with this name or min_points already exists', 409);
      }
      throw error;
    }
  },

  async deleteLoyaltyTier(id: number): Promise<boolean> {
    const result = await getPool().query('DELETE FROM loyalty_tiers WHERE id = $1 RETURNING id', [
      id,
    ]);
    return (result?.rowCount ?? 0) > 0;
  },

  async getUserLoyaltyTier(userId: number): Promise<LoyaltyTier | undefined> {
    const userPoints = await this.getLoyaltyPoints(userId);
    const result = await getPool().query(
      'SELECT * FROM loyalty_tiers WHERE min_points <= $1 ORDER BY min_points DESC LIMIT 1',
      [userPoints],
    );
    return result.rows[0];
  },

  async updateAllCustomerTiers(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get all tiers, ordered from highest to lowest
      const tiersResult = await client.query(
        'SELECT * FROM loyalty_tiers ORDER BY min_points DESC',
      );
      const tiers = tiersResult.rows;

      if (tiers.length === 0) {
        await client.query('COMMIT');
        return;
      }

      // 2. Get all customers with their loyalty points (joining on email)
      const customersResult = await client.query(`
        SELECT c.id, c.loyalty_tier_id, u.loyalty_points
        FROM customers c
        JOIN users u ON c.email = u.email
      `);
      const customers = customersResult.rows;

      const updates: { customerId: number; newTierId: number | null }[] = [];

      // 3. Determine the new tier for each customer
      for (const customer of customers) {
        let newTierId: number | null = null;
        for (const tier of tiers) {
          if (customer.loyalty_points >= tier.min_points) {
            newTierId = tier.id;
            break; // Found the highest applicable tier
          }
        }

        if (customer.loyalty_tier_id !== newTierId) {
          updates.push({ customerId: customer.id, newTierId });
        }
      }

      if (updates.length === 0) {
        await client.query('COMMIT');
        return;
      }

      // 4. Batch update the customers table
      const values = updates.map((u) => `(${u.customerId}, ${u.newTierId})`).join(',');
      const updateQuery = `
        UPDATE customers SET loyalty_tier_id = temp.new_tier_id
        FROM (VALUES
          ${values}
        ) AS temp(customer_id, new_tier_id)
        WHERE customers.id = temp.customer_id;
      `;
      await client.query(updateQuery);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating customer loyalty tiers:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};
