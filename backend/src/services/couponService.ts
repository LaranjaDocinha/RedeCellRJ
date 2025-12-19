import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Coupon {
  id: number;
  code: string;
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

interface CreateCouponPayload {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  is_active?: boolean;
}

interface UpdateCouponPayload {
  code?: string;
  type?: 'percentage' | 'fixed_amount';
  value?: number;
  start_date?: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  is_active?: boolean;
}

class CouponService {
  async getAllCoupons(): Promise<Coupon[]> {
    const result = await pool.query('SELECT * FROM coupons');
    return result.rows;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [code]);
    return result.rows[0];
  }

  async getCouponById(id: number): Promise<Coupon | undefined> {
    const result = await pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const { code, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } =
      payload;
    try {
      const result = await pool.query(
        'INSERT INTO coupons (code, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [code, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active],
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateCoupon(code: string, payload: UpdateCouponPayload): Promise<Coupon | undefined> {
    const { type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (type !== undefined) {
      fields.push(`type = $${paramIndex++}`);
      values.push(type);
    }
    if (value !== undefined) {
      fields.push(`value = $${paramIndex++}`);
      values.push(value);
    }
    if (start_date !== undefined) {
      fields.push(`start_date = $${paramIndex++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      fields.push(`end_date = $${paramIndex++}`);
      values.push(end_date);
    }
    if (min_purchase_amount !== undefined) {
      fields.push(`min_purchase_amount = $${paramIndex++}`);
      values.push(min_purchase_amount);
    }
    if (max_uses !== undefined) {
      fields.push(`max_uses = $${paramIndex++}`);
      values.push(max_uses);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (fields.length === 0) {
      const existingCoupon = await this.getCouponByCode(code);
      if (!existingCoupon) {
        return undefined; // No coupon found to update
      }
      return existingCoupon; // No fields to update, return existing coupon
    }

    values.push(code); // Add code for WHERE clause
    const query = `UPDATE coupons SET ${fields.join(', ')}, updated_at = current_timestamp WHERE code = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  async deleteCouponByCode(code: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM coupons WHERE code = $1 RETURNING id', [code]);
    return (result?.rowCount ?? 0) > 0;
  }

  async applyCoupon(couponCode: string, currentAmount: number): Promise<number> {
    const coupon = await this.getCouponByCode(couponCode);
    if (
      !coupon ||
      !coupon.is_active ||
      (coupon.end_date && new Date() > coupon.end_date) ||
      (coupon.max_uses && coupon.uses_count >= coupon.max_uses) ||
      (coupon.min_purchase_amount && currentAmount < coupon.min_purchase_amount)
    ) {
      throw new AppError('Coupon not applicable', 400);
    }

    let finalAmount = currentAmount;
    if (coupon.type === 'percentage') {
      finalAmount = currentAmount * (1 - coupon.value);
    } else if (coupon.type === 'fixed_amount') {
      finalAmount = currentAmount - coupon.value;
    }

    // Increment uses count
    await pool.query('UPDATE coupons SET uses_count = uses_count + 1 WHERE code = $1', [
      couponCode,
    ]);

    return Math.max(0, finalAmount); // Ensure amount doesn't go below zero
  }
}

export const couponService = new CouponService();
