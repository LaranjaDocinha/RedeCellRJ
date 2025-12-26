import { getPool } from '../db/index.js';
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
  async getLoyaltyPoints(customerId: number) {
    const { rows } = await getPool().query('SELECT loyalty_points FROM customers WHERE id = $1', [
      customerId,
    ]);
    if (rows.length === 0) {
      throw new AppError('Customer not found', 404);
    }
    return rows[0].loyalty_points;
  },

  async addLoyaltyPoints(customerId: number, points: number, reason: string) {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // Update customer's points
      const {
        rows: [customer],
      } = await client.query(
        'UPDATE customers SET loyalty_points = loyalty_points + $1 WHERE id = $2 RETURNING loyalty_points',
        [points, customerId],
      );

      if (!customer) {
        throw new AppError('Customer not found.', 404);
      }

      // Log transaction
      await client.query(
        'INSERT INTO loyalty_transactions (customer_id, points, type, reason) VALUES ($1, $2, $3, $4)',
        [customerId, points, points > 0 ? 'earned' : 'redeemed', reason],
      );

      await client.query('COMMIT');
      return customer.loyalty_points;
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

  async redeemLoyaltyPoints(customerId: number, points: number, reason: string) {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // Check if customer has enough points
      const {
        rows: [customer],
      } = await client.query('SELECT loyalty_points FROM customers WHERE id = $1 FOR UPDATE', [customerId]);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
      if (customer.loyalty_points < points) {
        throw new AppError('Insufficient loyalty points.', 400);
      }

      // Deduct points
      const {
        rows: [updatedCustomer],
      } = await client.query(
        'UPDATE customers SET loyalty_points = loyalty_points - $1 WHERE id = $2 RETURNING loyalty_points',
        [points, customerId],
      );

      // Log transaction
      await client.query(
        'INSERT INTO loyalty_transactions (customer_id, points, type, reason) VALUES ($1, $2, $3, $4)',
        [customerId, -points, 'redeemed', reason],
      );

      await client.query('COMMIT');
      return updatedCustomer.loyalty_points;
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

  async getLoyaltyTransactions(customerId: number) {
    const { rows: customerCheck } = await getPool().query('SELECT id FROM customers WHERE id = $1', [
      customerId,
    ]);
    if (customerCheck.length === 0) {
      throw new AppError('Customer not found', 404);
    }
    const { rows } = await getPool().query(
      'SELECT points as points_change, reason, created_at FROM loyalty_transactions WHERE customer_id = $1 ORDER BY created_at DESC',
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
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // 1. Get all tiers, ordered from highest to lowest
      const tiersResult = await client.query(
        'SELECT * FROM loyalty_tiers ORDER BY min_points DESC',
      );
      const tiers = tiersResult.rows;

      if (tiers.length === 0) {
        console.log('No loyalty tiers defined. Skipping tier update.');
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
        console.log('All customer loyalty tiers are up to date.');
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
      console.log(`Updated loyalty tiers for ${updates.length} customers.`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating customer loyalty tiers:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};
