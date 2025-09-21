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
class PurchaseOrderService {
    getAllPurchaseOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM purchase_orders');
            return result.rows;
        });
    }
    getPurchaseOrderById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderResult = yield pool.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
            if (orderResult.rows.length === 0)
                return undefined;
            const order = orderResult.rows[0];
            const itemsResult = yield pool.query('SELECT product_id, variation_id, quantity, unit_price FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
            order.items = itemsResult.rows;
            return order;
        });
    }
    createPurchaseOrder(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                const { supplier_id, expected_delivery_date, status, items } = payload;
                let total_amount = 0; // Calculate total amount from items
                for (const item of items) {
                    total_amount += item.quantity * item.unit_price;
                }
                const orderResult = yield client.query('INSERT INTO purchase_orders (supplier_id, expected_delivery_date, status, total_amount) VALUES ($1, $2, $3, $4) RETURNING *', [supplier_id, expected_delivery_date, status || 'pending', total_amount]);
                const newOrder = orderResult.rows[0];
                for (const item of items) {
                    yield client.query('INSERT INTO purchase_order_items (purchase_order_id, product_id, variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)', [newOrder.id, item.product_id, item.variation_id, item.quantity, item.unit_price]);
                }
                yield client.query('COMMIT');
                return Object.assign(Object.assign({}, newOrder), { items });
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
    updatePurchaseOrder(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                const { supplier_id, expected_delivery_date, status, items } = payload;
                const fields = [];
                const values = [];
                let paramIndex = 1;
                if (supplier_id !== undefined) {
                    fields.push(`supplier_id = $${paramIndex++}`);
                    values.push(supplier_id);
                }
                if (expected_delivery_date !== undefined) {
                    fields.push(`expected_delivery_date = $${paramIndex++}`);
                    values.push(expected_delivery_date);
                }
                if (status !== undefined) {
                    fields.push(`status = $${paramIndex++}`);
                    values.push(status);
                }
                if (fields.length > 0) {
                    values.push(id); // Add id for WHERE clause
                    const query = `UPDATE purchase_orders SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
                    yield client.query(query, values);
                }
                if (items !== undefined) {
                    // Delete existing order items
                    yield client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
                    // Insert new order items
                    let newTotalAmount = 0;
                    for (const item of items) {
                        newTotalAmount += item.quantity * item.unit_price;
                        yield client.query('INSERT INTO purchase_order_items (purchase_order_id, product_id, variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)', [id, item.product_id, item.variation_id, item.quantity, item.unit_price]);
                    }
                    // Update total_amount in purchase_orders table
                    yield client.query('UPDATE purchase_orders SET total_amount = $1 WHERE id = $2', [newTotalAmount, id]);
                }
                const updatedOrder = yield this.getPurchaseOrderById(id);
                yield client.query('COMMIT');
                return updatedOrder;
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
    deletePurchaseOrder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                yield client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
                const result = yield client.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING id', [id]);
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
    receivePurchaseOrderItems(orderId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                // 1. Verificar se a ordem de compra existe e está no status 'ordered'
                const order = yield this.getPurchaseOrderById(orderId);
                if (!order) {
                    throw new AppError(`Purchase order ${orderId} not found.`, 404);
                }
                if (order.status !== 'ordered') {
                    throw new AppError(`Purchase order ${orderId} is not in 'ordered' status. Current status: ${order.status}`, 400);
                }
                // 2. Atualizar o estoque dos produtos recebidos
                for (const receivedItem of items) {
                    // Verificar se o item recebido faz parte da ordem de compra original
                    const originalItem = (_a = order.items) === null || _a === void 0 ? void 0 : _a.find(item => item.product_id === receivedItem.product_id && item.variation_id === receivedItem.variation_id);
                    if (!originalItem) {
                        throw new AppError(`Item (product_id: ${receivedItem.product_id}, variation_id: ${receivedItem.variation_id}) not found in purchase order ${orderId}.`, 400);
                    }
                    // Atualizar estoque da variação do produto
                    yield client.query('UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE product_id = $2 AND id = $3', [receivedItem.quantity, receivedItem.product_id, receivedItem.variation_id]);
                }
                // 3. Atualizar o status da ordem de compra para 'received'
                yield client.query('UPDATE purchase_orders SET status = $1, updated_at = current_timestamp WHERE id = $2', ['received', orderId]);
                yield client.query('COMMIT');
                return yield this.getPurchaseOrderById(orderId); // Retornar a ordem de compra atualizada
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
export const purchaseOrderService = new PurchaseOrderService();
