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
import { inventoryService } from './inventoryService.js'; // Import inventoryService
class ReturnService {
    getAllReturns() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM returns');
            return result.rows;
        });
    }
    getReturnById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const returnResult = yield pool.query('SELECT * FROM returns WHERE id = $1', [id]);
            if (returnResult.rows.length === 0)
                return undefined;
            const returnRecord = returnResult.rows[0];
            const itemsResult = yield pool.query('SELECT * FROM return_items WHERE return_id = $1', [id]);
            returnRecord.items = itemsResult.rows;
            return returnRecord;
        });
    }
    createReturn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                const { sale_id, reason, items } = payload;
                // Fetch sale details to calculate refund amount
                const saleResult = yield client.query('SELECT total_amount FROM sales WHERE id = $1', [sale_id]);
                if (saleResult.rows.length === 0) {
                    throw new AppError('Sale not found', 404);
                }
                const saleTotalAmount = parseFloat(saleResult.rows[0].total_amount);
                let calculatedRefundAmount = 0;
                const returnItemsDetails = [];
                for (const item of items) {
                    // Fetch product variation price at the time of sale (or current price if not available)
                    const saleItemResult = yield client.query('SELECT price_at_sale FROM sale_items WHERE sale_id = $1 AND product_id = $2 AND variation_id = $3', [sale_id, item.product_id, item.variation_id]);
                    let priceAtReturn = 0;
                    if (saleItemResult.rows.length > 0) {
                        priceAtReturn = parseFloat(saleItemResult.rows[0].price_at_sale);
                    }
                    else {
                        // Fallback to current product variation price if not found in sale_items
                        const currentPriceResult = yield client.query('SELECT price FROM product_variations WHERE product_id = $1 AND id = $2', [item.product_id, item.variation_id]);
                        if (currentPriceResult.rows.length === 0) {
                            throw new AppError(`Product variation ${item.variation_id} not found.`, 404);
                        }
                        priceAtReturn = parseFloat(currentPriceResult.rows[0].price);
                    }
                    calculatedRefundAmount += priceAtReturn * item.quantity;
                    returnItemsDetails.push(Object.assign(Object.assign({}, item), { price_at_return: priceAtReturn }));
                    // Restock item in inventory
                    yield inventoryService.adjustStock(item.variation_id, item.quantity); // Add quantity back to stock
                }
                // Insert return record
                const returnResult = yield client.query('INSERT INTO returns (sale_id, reason, refund_amount, status) VALUES ($1, $2, $3, $4) RETURNING *', [sale_id, reason, calculatedRefundAmount, 'pending']);
                const newReturn = returnResult.rows[0];
                // Insert return items
                for (const itemDetail of returnItemsDetails) {
                    yield client.query('INSERT INTO return_items (return_id, product_id, variation_id, quantity, price_at_return) VALUES ($1, $2, $3, $4, $5)', [newReturn.id, itemDetail.product_id, itemDetail.variation_id, itemDetail.quantity, itemDetail.price_at_return]);
                }
                yield client.query('COMMIT');
                return Object.assign(Object.assign({}, newReturn), { items: returnItemsDetails });
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
    updateReturn(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { reason, status, refund_amount } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (reason !== undefined) {
                fields.push(`reason = $${paramIndex++}`);
                values.push(reason);
            }
            if (status !== undefined) {
                fields.push(`status = $${paramIndex++}`);
                values.push(status);
            }
            if (refund_amount !== undefined) {
                fields.push(`refund_amount = $${paramIndex++}`);
                values.push(refund_amount);
            }
            if (fields.length === 0) {
                const existingReturn = yield this.getReturnById(id);
                if (!existingReturn) {
                    return undefined; // No return found to update
                }
                return existingReturn; // No fields to update, return existing return
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE returns SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
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
    deleteReturn(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM returns WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const returnService = new ReturnService();
