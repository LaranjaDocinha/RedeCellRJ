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
class ProductKitService {
    getAllProductKits() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM product_kits');
            return result.rows;
        });
    }
    getProductKitById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const kitResult = yield pool.query('SELECT * FROM product_kits WHERE id = $1', [id]);
            if (kitResult.rows.length === 0)
                return undefined;
            const kit = kitResult.rows[0];
            const itemsResult = yield pool.query('SELECT product_id, variation_id, quantity FROM product_kit_items WHERE kit_id = $1', [id]);
            kit.items = itemsResult.rows;
            return kit;
        });
    }
    createProductKit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                const { name, description, price, is_active, items } = payload;
                const kitResult = yield client.query('INSERT INTO product_kits (name, description, price, is_active) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, price, is_active]);
                const newKit = kitResult.rows[0];
                for (const item of items) {
                    yield client.query('INSERT INTO product_kit_items (kit_id, product_id, variation_id, quantity) VALUES ($1, $2, $3, $4)', [newKit.id, item.product_id, item.variation_id, item.quantity]);
                }
                yield client.query('COMMIT');
                return newKit;
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
    }
    updateProductKit(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                const { name, description, price, is_active, items } = payload;
                const fields = [];
                const values = [];
                let paramIndex = 1;
                if (name !== undefined) {
                    fields.push(`name = $${paramIndex++}`);
                    values.push(name);
                }
                if (description !== undefined) {
                    fields.push(`description = $${paramIndex++}`);
                    values.push(description);
                }
                if (price !== undefined) {
                    fields.push(`price = $${paramIndex++}`);
                    values.push(price);
                }
                if (is_active !== undefined) {
                    fields.push(`is_active = $${paramIndex++}`);
                    values.push(is_active);
                }
                if (fields.length > 0) {
                    values.push(id); // Add id for WHERE clause
                    const query = `UPDATE product_kits SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
                    yield client.query(query, values);
                }
                if (items !== undefined) {
                    // Delete existing kit items
                    yield client.query('DELETE FROM product_kit_items WHERE kit_id = $1', [id]);
                    // Insert new kit items
                    for (const item of items) {
                        yield client.query('INSERT INTO product_kit_items (kit_id, product_id, variation_id, quantity) VALUES ($1, $2, $3, $4)', [id, item.product_id, item.variation_id, item.quantity]);
                    }
                }
                const updatedKit = yield this.getProductKitById(id);
                yield client.query('COMMIT');
                return updatedKit;
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
    }
    deleteProductKit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                yield client.query('DELETE FROM product_kit_items WHERE kit_id = $1', [id]);
                const result = yield client.query('DELETE FROM product_kits WHERE id = $1 RETURNING id', [id]);
                yield client.query('COMMIT');
                return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
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
    }
}
export const productKitService = new ProductKitService();
