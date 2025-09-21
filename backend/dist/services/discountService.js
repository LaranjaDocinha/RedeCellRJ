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
class DiscountService {
    getAllDiscounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM discounts');
            return result.rows;
        });
    }
    getDiscountById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM discounts WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createDiscount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } = payload;
            try {
                const result = yield pool.query('INSERT INTO discounts (name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Discount with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    updateDiscount(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (name !== undefined) {
                fields.push(`name = $${paramIndex++}`);
                values.push(name);
            }
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
                const existingDiscount = yield this.getDiscountById(id);
                if (!existingDiscount) {
                    return undefined; // No discount found to update
                }
                return existingDiscount; // No fields to update, return existing discount
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE discounts SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
        });
    }
    deleteDiscount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM discounts WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
    applyDiscount(discountId, currentAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const discount = yield this.getDiscountById(discountId);
            if (!discount || !discount.is_active || (discount.end_date && new Date() > discount.end_date) || (discount.max_uses && discount.uses_count >= discount.max_uses) || (discount.min_purchase_amount && currentAmount < discount.min_purchase_amount)) {
                throw new AppError('Discount not applicable', 400);
            }
            let finalAmount = currentAmount;
            if (discount.type === 'percentage') {
                finalAmount = currentAmount * (1 - discount.value);
            }
            else if (discount.type === 'fixed_amount') {
                finalAmount = currentAmount - discount.value;
            }
            // Increment uses count
            yield pool.query('UPDATE discounts SET uses_count = uses_count + 1 WHERE id = $1', [discountId]);
            return Math.max(0, finalAmount); // Ensure amount doesn't go below zero
        });
    }
}
export const discountService = new DiscountService();
