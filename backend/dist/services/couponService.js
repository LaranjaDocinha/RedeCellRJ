var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
class CouponService {
    getAllCoupons() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM coupons');
            return result.rows;
        });
    }
    getCouponByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM coupons WHERE code = $1', [code]);
            return result.rows[0];
        });
    }
    getCouponById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createCoupon(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } = payload;
            try {
                const result = yield pool.query('INSERT INTO coupons (code, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [code, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active]);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateCoupon(code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } = payload;
            const fields = [];
            const values = [];
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
                const existingCoupon = yield this.getCouponByCode(code);
                if (!existingCoupon) {
                    return undefined; // No coupon found to update
                }
                return existingCoupon; // No fields to update, return existing coupon
            }
            values.push(code); // Add code for WHERE clause
            const query = `UPDATE coupons SET ${fields.join(', ')}, updated_at = current_timestamp WHERE code = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteCoupon(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM coupons WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
    deleteCouponByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM coupons WHERE code = $1 RETURNING id', [code]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
    applyCoupon(couponCode, currentAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const coupon = yield this.getCouponByCode(couponCode);
            if (!coupon || !coupon.is_active || (coupon.end_date && new Date() > coupon.end_date) || (coupon.max_uses && coupon.uses_count >= coupon.max_uses) || (coupon.min_purchase_amount && currentAmount < coupon.min_purchase_amount)) {
                throw new AppError('Coupon not applicable', 400);
            }
            let finalAmount = currentAmount;
            if (coupon.type === 'percentage') {
                finalAmount = currentAmount * (1 - coupon.value);
            }
            else if (coupon.type === 'fixed_amount') {
                finalAmount = currentAmount - coupon.value;
            }
            // Increment uses count
            yield pool.query('UPDATE coupons SET uses_count = uses_count + 1 WHERE code = $1', [couponCode]);
            return Math.max(0, finalAmount); // Ensure amount doesn't go below zero
        });
    }
}
export const couponService = new CouponService();
