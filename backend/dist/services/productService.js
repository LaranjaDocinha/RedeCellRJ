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
export const productService = {
    getAllProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT id, name, description, sku, branch_id FROM products ORDER BY name ASC');
            return result.rows;
        });
    },
    getProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const productResult = yield pool.query('SELECT * FROM products WHERE id = $1', [
                id,
            ]);
            if (productResult.rowCount === 0) {
                return null;
            }
            const variationsResult = yield pool.query('SELECT * FROM product_variations WHERE product_id = $1', [id]);
            const product = productResult.rows[0];
            product.variations = variationsResult.rows;
            return product;
        });
    },
    createProduct(productData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, branch_id, sku, product_type, variations } = productData;
            yield pool.query('BEGIN');
            try {
                const productResult = yield pool.query('INSERT INTO products (name, branch_id, sku, product_type) VALUES ($1, $2, $3, $4) RETURNING id', [name, branch_id, sku, product_type]);
                const newProductId = productResult.rows[0].id;
                const variationValues = variations
                    .map(v => `(${newProductId}, '${v.color}', ${v.price}, ${v.stock_quantity}, ${v.low_stock_threshold || 0})`)
                    .join(',');
                if (variationValues) {
                    yield pool.query(`INSERT INTO product_variations (product_id, color, price, stock_quantity, low_stock_threshold) VALUES ${variationValues}`);
                }
                yield pool.query('COMMIT');
                const newProduct = yield this.getProductById(newProductId);
                return newProduct;
            }
            catch (error) {
                yield pool.query('ROLLBACK');
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
        });
    },
    updateProduct(id, productData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { name, variations } = productData;
            yield pool.query('BEGIN');
            try {
                if (name) {
                    yield pool.query('UPDATE products SET name = $1 WHERE id = $2', [name, id]);
                }
                if (variations) {
                    const existingVariationsResult = yield pool.query('SELECT id FROM product_variations WHERE product_id = $1', [id]);
                    const existingVariationIds = new Set(existingVariationsResult.rows.map(r => r.id));
                    const incomingVariationIds = new Set(variations.filter(v => v.id).map(v => v.id));
                    const idsToDelete = [...existingVariationIds].filter(existingId => !incomingVariationIds.has(existingId));
                    if (idsToDelete.length > 0) {
                        yield pool.query('DELETE FROM product_variations WHERE id = ANY($1::int[])', [idsToDelete]);
                    }
                    for (const variation of variations) {
                        if (variation.id && existingVariationIds.has(variation.id)) {
                            // Fetch old price before updating
                            const oldVariationResult = yield pool.query('SELECT price FROM product_variations WHERE id = $1', [variation.id]);
                            const oldPrice = (_a = oldVariationResult.rows[0]) === null || _a === void 0 ? void 0 : _a.price;
                            yield pool.query('UPDATE product_variations SET color = $1, price = $2, stock_quantity = $3, low_stock_threshold = $4 WHERE id = $5', [variation.color, variation.price, variation.stock_quantity, variation.low_stock_threshold || 0, variation.id]);
                            // Record price change if price is different
                            if (oldPrice !== undefined && oldPrice !== variation.price) {
                                yield pool.query('INSERT INTO product_price_history (product_id, variation_id, old_price, new_price) VALUES ($1, $2, $3, $4)', [id, variation.id, oldPrice, variation.price]);
                            }
                        }
                        else if (!variation.id) {
                            yield pool.query('INSERT INTO product_variations (product_id, color, price, stock_quantity, low_stock_threshold) VALUES ($1, $2, $3, $4, $5)', [id, variation.color, variation.price, variation.stock_quantity, variation.low_stock_threshold || 0]);
                        }
                    }
                }
                const updatedProduct = yield this.getProductById(id);
                yield pool.query('COMMIT');
                return updatedProduct;
            }
            catch (error) {
                yield pool.query('ROLLBACK');
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
        });
    },
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield pool.query('DELETE FROM product_variations WHERE product_id = $1', [id]);
            const result = yield pool.query('DELETE FROM products WHERE id = $1', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    },
    getProductPriceHistory(productId, variationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM product_price_history WHERE product_id = $1 AND variation_id = $2 ORDER BY changed_at DESC', [productId, variationId]);
            return result.rows;
        });
    },
};
