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
export const loyaltyService = {
    getLoyaltyPoints(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield pool.query('SELECT loyalty_points FROM users WHERE id = $1', [userId]);
            return rows[0] ? rows[0].loyalty_points : 0;
        });
    },
    addLoyaltyPoints(userId, points, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                // Update user's points
                const { rows: [user] } = yield client.query('UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2 RETURNING loyalty_points', [points, userId]);
                if (!user) {
                    throw new AppError('User not found.', 404);
                }
                // Log transaction
                yield client.query('INSERT INTO loyalty_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [userId, points, reason]);
                yield client.query('COMMIT');
            }
            catch (error) {
                yield client.query('ROLLBACK');
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
            finally {
                client.release();
            }
        });
    },
    redeemLoyaltyPoints(userId, points, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                // Check if user has enough points
                const { rows: [user] } = yield client.query('SELECT loyalty_points FROM users WHERE id = $1 FOR UPDATE', [userId]);
                if (!user || user.loyalty_points < points) {
                    throw new AppError('Insufficient loyalty points.', 400);
                }
                // Deduct points
                const { rows: [updatedUser] } = yield client.query('UPDATE users SET loyalty_points = loyalty_points - $1 WHERE id = $2 RETURNING loyalty_points', [points, userId]);
                // Log transaction
                yield client.query('INSERT INTO loyalty_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [userId, -points, reason]);
                yield client.query('COMMIT');
                return updatedUser.loyalty_points;
            }
            catch (error) {
                yield client.query('ROLLBACK');
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
            finally {
                client.release();
            }
        });
    },
    getLoyaltyTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield pool.query('SELECT points_change, reason, created_at FROM loyalty_transactions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
            return rows;
        });
    },
    // Loyalty Tier Management
    getAllLoyaltyTiers() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM loyalty_tiers ORDER BY min_points ASC');
            return result.rows;
        });
    },
    getLoyaltyTierById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM loyalty_tiers WHERE id = $1', [id]);
            return result.rows[0];
        });
    },
    createLoyaltyTier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, min_points, description, benefits } = payload;
            try {
                const result = yield pool.query('INSERT INTO loyalty_tiers (name, min_points, description, benefits) VALUES ($1, $2, $3, $4) RETURNING *', [name, min_points, description, benefits]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Loyalty tier with this name or min_points already exists', 409);
                }
                throw error;
            }
        });
    },
    updateLoyaltyTier(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, min_points, description, benefits } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (name !== undefined) {
                fields.push(`name = ${paramIndex++}`);
                values.push(name);
            }
            if (min_points !== undefined) {
                fields.push(`min_points = ${paramIndex++}`);
                values.push(min_points);
            }
            if (description !== undefined) {
                fields.push(`description = ${paramIndex++}`);
                values.push(description);
            }
            if (benefits !== undefined) {
                fields.push(`benefits = ${paramIndex++}`);
                values.push(benefits);
            }
            if (fields.length === 0) {
                const existingTier = yield this.getLoyaltyTierById(id);
                if (!existingTier) {
                    return undefined; // No tier found to update
                }
                return existingTier; // No fields to update, return existing tier
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE loyalty_tiers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = ${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Loyalty tier with this name or min_points already exists', 409);
                }
                throw error;
            }
        });
    },
    deleteLoyaltyTier(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM loyalty_tiers WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    },
    getUserLoyaltyTier(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userPoints = yield this.getLoyaltyPoints(userId);
            const result = yield pool.query('SELECT * FROM loyalty_tiers WHERE min_points <= $1 ORDER BY min_points DESC LIMIT 1', [userPoints]);
            return result.rows[0];
        });
    },
};
