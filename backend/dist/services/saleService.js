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
import { discountService } from './discountService.js'; // Import discountService
import { productKitService } from './productKitService.js'; // Import productKitService
import { notificationEmitter } from '../utils/notificationEmitter.js'; // Import notificationEmitter
export const saleService = {
    createSale(userId, items, discountId, paymentMethod, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                let totalAmount = 0;
                const saleItemsDetails = [];
                // Validate items and calculate total amount
                for (const item of items) {
                    if (item.kit_id) {
                        // Handle product kit
                        const productKit = yield productKitService.getProductKitById(item.kit_id);
                        if (!productKit) {
                            throw new AppError(`Product kit ${item.kit_id} not found.`, 404);
                        }
                        // Deduct stock for each item in the kit
                        for (const kitItem of productKit.items) {
                            const productVariationResult = yield client.query('SELECT stock_quantity FROM product_variations WHERE id = $1 AND product_id = $2;', [kitItem.variation_id, kitItem.product_id]);
                            if (productVariationResult.rows.length === 0) {
                                throw new AppError(`Product variation ${kitItem.variation_id} from kit ${item.kit_id} not found.`, 404);
                            }
                            const { stock_quantity } = productVariationResult.rows[0];
                            if (stock_quantity < kitItem.quantity * item.quantity) {
                                throw new AppError(`Insufficient stock for kit item variation ${kitItem.variation_id}. Available: ${stock_quantity}, Requested: ${kitItem.quantity * item.quantity}`, 400);
                            }
                            yield client.query('UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2;', [kitItem.quantity * item.quantity, kitItem.variation_id]);
                        }
                        totalAmount += parseFloat(productKit.price.toString()) * item.quantity; // Use kit price
                        saleItemsDetails.push(Object.assign(Object.assign({}, item), { price_at_sale: parseFloat(productKit.price.toString()), is_kit: true, kit_details: productKit.items }));
                    }
                    else if (item.product_id && item.variation_id) {
                        // Handle individual product variation
                        const productVariationResult = yield client.query('SELECT price, stock_quantity FROM product_variations WHERE id = $1 AND product_id = $2;', [item.variation_id, item.product_id]);
                        if (productVariationResult.rows.length === 0) {
                            throw new AppError(`Product variation ${item.variation_id} not found.`, 404);
                        }
                        const { price, stock_quantity } = productVariationResult.rows[0];
                        if (stock_quantity < item.quantity) {
                            throw new AppError(`Insufficient stock for variation ${item.variation_id}. Available: ${stock_quantity}, Requested: ${item.quantity}`, 400);
                        }
                        const itemPrice = parseFloat(price) * item.quantity;
                        totalAmount += itemPrice;
                        saleItemsDetails.push(Object.assign(Object.assign({}, item), { price_at_sale: parseFloat(price) }));
                        // Update stock quantity
                        yield client.query('UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2;', [item.quantity, item.variation_id]);
                    }
                    else {
                        throw new AppError('Invalid sale item: missing product_id/variation_id or kit_id', 400);
                    }
                }
                // Apply discount if provided
                let appliedDiscountId = null;
                if (discountId) {
                    const discountedAmount = yield discountService.applyDiscount(discountId, totalAmount);
                    totalAmount = discountedAmount;
                    appliedDiscountId = discountId;
                }
                // Insert sale record
                const saleResult = yield client.query('INSERT INTO sales (user_id, total_amount, discount_id, payment_method, transaction_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, sale_date;', [userId, totalAmount, appliedDiscountId, paymentMethod, transactionId]);
                const newSale = saleResult.rows[0];
                // Insert sale items
                for (const itemDetail of saleItemsDetails) {
                    yield client.query('INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4, $5);', [newSale.id, itemDetail.product_id, itemDetail.variation_id, itemDetail.quantity, itemDetail.price_at_sale]);
                }
                yield client.query('COMMIT');
                notificationEmitter.emitNewOrder(newSale.id, `New sale created: ${newSale.id} for ${totalAmount.toFixed(2)}`); // Emit notification
                return Object.assign(Object.assign({}, newSale), { total_amount: totalAmount, items: saleItemsDetails });
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
    getSaleById(saleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const saleResult = yield pool.query('SELECT * FROM sales WHERE id = $1;', [saleId]);
            if (saleResult.rows.length === 0)
                return null;
            const sale = saleResult.rows[0];
            const itemsResult = yield pool.query('SELECT * FROM sale_items WHERE sale_id = $1;', [saleId]);
            sale.items = itemsResult.rows;
            return sale;
        });
    },
    getAllSales() {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield pool.query('SELECT * FROM sales ORDER BY sale_date DESC;');
            // Para cada venda, buscar seus itens
            for (const sale of rows) {
                const itemsResult = yield pool.query('SELECT * FROM sale_items WHERE sale_id = $1;', [sale.id]);
                sale.items = itemsResult.rows;
            }
            return rows;
        });
    },
};
