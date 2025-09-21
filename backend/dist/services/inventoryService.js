var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppError } from '../utils/errors.js';
import pool from '../db/index.js';
import { notificationEmitter } from '../utils/notificationEmitter.js'; // Import notificationEmitter
export const inventoryService = {
    getLowStockProducts() {
        return __awaiter(this, arguments, void 0, function* (threshold = 10) {
            const { rows } = yield pool.query(`SELECT
        pv.id as variation_id,
        p.name as product_name,
        pv.color,
        pv.stock_quantity,
        pv.price,
        pv.low_stock_threshold
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.stock_quantity <= pv.low_stock_threshold
      ORDER BY pv.stock_quantity ASC, p.name ASC`);
            return rows;
        });
    },
    adjustStock(variationId, quantityChange) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                // Get current stock
                const { rows: [variation] } = yield client.query('SELECT stock_quantity, low_stock_threshold FROM product_variations WHERE id = $1 FOR UPDATE', [variationId]);
                if (!variation) {
                    throw new Error('Product variation not found.');
                }
                const newStock = variation.stock_quantity + quantityChange;
                if (newStock < 0) {
                    throw new Error('Stock quantity cannot be negative.');
                }
                // Update stock
                const { rows: [updatedVariation] } = yield client.query('UPDATE product_variations SET stock_quantity = $1 WHERE id = $2 RETURNING *', [newStock, variationId]);
                // Check for low stock after update
                if (updatedVariation.stock_quantity <= updatedVariation.low_stock_threshold) {
                    notificationEmitter.emitLowStock(updatedVariation.product_id, updatedVariation.id, updatedVariation.stock_quantity, updatedVariation.low_stock_threshold); // Emit notification
                }
                yield client.query('COMMIT');
                return updatedVariation;
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
    receiveStock(variationId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (quantity <= 0) {
                throw new Error('Quantity must be positive to receive stock.');
            }
            return this.adjustStock(variationId, quantity);
        });
    },
    dispatchStock(variationId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (quantity <= 0) {
                throw new Error('Quantity must be positive to dispatch stock.');
            }
            return this.adjustStock(variationId, -quantity);
        });
    },
};
