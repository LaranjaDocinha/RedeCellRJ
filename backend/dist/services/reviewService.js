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
class ReviewService {
    getReviewsByProductId(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT pr.*, u.email as user_email, u.name as user_name FROM product_reviews pr JOIN users u ON pr.user_id = u.id WHERE pr.product_id = $1 ORDER BY pr.created_at DESC', [productId]);
            return result.rows;
        });
    }
    getReviewById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM product_reviews WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createReview(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { product_id, user_id, rating, comment } = payload;
            try {
                // Check if user has already reviewed this product
                const existingReview = yield pool.query('SELECT id FROM product_reviews WHERE product_id = $1 AND user_id = $2', [product_id, user_id]);
                if (existingReview.rows.length > 0) {
                    throw new AppError('You have already reviewed this product', 409);
                }
                const result = yield pool.query('INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *', [product_id, user_id, rating, comment]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('You have already reviewed this product', 409);
                }
                throw error;
            }
        });
    }
    updateReview(id, userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rating, comment } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (rating !== undefined) {
                fields.push(`rating = $${paramIndex++}`);
                values.push(rating);
            }
            if (comment !== undefined) {
                fields.push(`comment = $${paramIndex++}`);
                values.push(comment);
            }
            if (fields.length === 0) {
                const existingReview = yield this.getReviewById(id);
                if (!existingReview || existingReview.user_id !== userId) {
                    return undefined; // Not found or not authorized
                }
                return existingReview; // No fields to update, return existing review
            }
            values.push(id); // Add id for WHERE clause
            values.push(userId); // Add userId for authorization check
            const query = `UPDATE product_reviews SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;
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
    deleteReview(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM product_reviews WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const reviewService = new ReviewService();
