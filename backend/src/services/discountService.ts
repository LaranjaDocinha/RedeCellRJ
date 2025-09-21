import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Discount {
  id: number;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: Date;
  end_date?: Date;
  min_purchase_amount?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateDiscountPayload {
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  is_active?: boolean;
}

interface UpdateDiscountPayload {
  name?: string;
  type?: 'percentage' | 'fixed_amount';
  value?: number;
  start_date?: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  is_active?: boolean;
}

class DiscountService {
  async getAllDiscounts(): Promise<Discount[]> {
    const result = await pool.query('SELECT * FROM discounts');
    return result.rows;
  }

  async getDiscountById(id: number): Promise<Discount | undefined> {
    const result = await pool.query('SELECT * FROM discounts WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createDiscount(payload: CreateDiscountPayload): Promise<Discount> {
    const { name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO discounts (name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Discount with this name already exists', 409);
      }
      throw error;
    }
  }

  async updateDiscount(id: number, payload: UpdateDiscountPayload): Promise<Discount | undefined> {
    const { name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (type !== undefined) { fields.push(`type = $${paramIndex++}`); values.push(type); }
    if (value !== undefined) { fields.push(`value = $${paramIndex++}`); values.push(value); }
    if (start_date !== undefined) { fields.push(`start_date = $${paramIndex++}`); values.push(start_date); }
    if (end_date !== undefined) { fields.push(`end_date = $${paramIndex++}`); values.push(end_date); }
    if (min_purchase_amount !== undefined) { fields.push(`min_purchase_amount = $${paramIndex++}`); values.push(min_purchase_amount); }
    if (max_uses !== undefined) { fields.push(`max_uses = $${paramIndex++}`); values.push(max_uses); }
    if (is_active !== undefined) { fields.push(`is_active = $${paramIndex++}`); values.push(is_active); }

    if (fields.length === 0) {
      const existingDiscount = await this.getDiscountById(id);
      if (!existingDiscount) {
        return undefined; // No discount found to update
      }
      return existingDiscount; // No fields to update, return existing discount
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE discounts SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  }

  async deleteDiscount(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM discounts WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  async applyDiscount(discountId: number, currentAmount: number): Promise<number> {
    const discount = await this.getDiscountById(discountId);
    if (!discount || !discount.is_active || (discount.end_date && new Date() > discount.end_date) || (discount.max_uses && discount.uses_count >= discount.max_uses) || (discount.min_purchase_amount && currentAmount < discount.min_purchase_amount)) {
      throw new AppError('Discount not applicable', 400);
    }

    let finalAmount = currentAmount;
    if (discount.type === 'percentage') {
      finalAmount = currentAmount * (1 - discount.value);
    } else if (discount.type === 'fixed_amount') {
      finalAmount = currentAmount - discount.value;
    }

    // Increment uses count
    await pool.query('UPDATE discounts SET uses_count = uses_count + 1 WHERE id = $1', [discountId]);

    return Math.max(0, finalAmount); // Ensure amount doesn't go below zero
  }
}

export const discountService = new DiscountService();