import { getPool } from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { dynamicPricingService } from './dynamicPricingService.js'; // Importar o novo serviço
import redisClient from '../utils/redisClient.js'; // Importar redisClient
export const productService = {
    async getAllProducts(options = {}) {
        const { search, categoryId, branchId, isSerialized, minPrice, maxPrice, sortBy = 'name', sortDirection = 'ASC', limit = 10, offset = 0, } = options;
        const pool = getPool();
        const queryParams = [];
        let whereClause = 'WHERE 1=1';
        let paramIndex = 1;
        if (search) {
            whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }
        if (categoryId) {
            whereClause += ` AND p.category_id = $${paramIndex}`; // Assuming products have category_id
            queryParams.push(categoryId);
            paramIndex++;
        }
        if (branchId) {
            whereClause += ` AND p.branch_id = $${paramIndex}`;
            queryParams.push(branchId);
            paramIndex++;
        }
        if (isSerialized !== undefined) {
            whereClause += ` AND p.is_serialized = $${paramIndex}`;
            queryParams.push(isSerialized);
            paramIndex++;
        }
        if (minPrice) {
            whereClause += ` AND pv.price >= $${paramIndex}`; // Assuming pv.price is the min price
            queryParams.push(minPrice);
            paramIndex++;
        }
        if (maxPrice) {
            whereClause += ` AND pv.price <= $${paramIndex}`; // Assuming pv.price is the max price
            queryParams.push(maxPrice);
            paramIndex++;
        }
        const countQuery = `
      SELECT COUNT(DISTINCT p.id)
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      ${whereClause};
    `;
        const countResult = await pool.query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].count, 10);
        const productsQuery = `
      SELECT
        p.id, p.name, p.sku, p.branch_id, p.is_serialized,
        json_agg(pv.*) as variations
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      ${whereClause}
      GROUP BY p.id, p.name, p.sku, p.branch_id, p.is_serialized
      ORDER BY p.${sortBy} ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
        queryParams.push(limit, offset);
        const result = await pool.query(productsQuery, queryParams);
        return { products: result.rows, totalCount };
    },
    async getProductById(id) {
        const cacheKey = `product:${id}`;
        const cachedProduct = await redisClient.get(cacheKey);
        if (cachedProduct) {
            return JSON.parse(cachedProduct);
        }
        const pool = getPool();
        const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (productResult.rowCount === 0) {
            return null;
        }
        const variationsResult = await pool.query('SELECT * FROM product_variations WHERE product_id = $1', [id]);
        const product = productResult.rows[0];
        product.variations = variationsResult.rows;
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(product)); // Cache por 1 hora
        return product;
    },
    async createProduct(productData) {
        const { name, branch_id, sku, variations, is_serialized } = productData;
        const pool = getPool();
        await pool.query('BEGIN');
        try {
            console.log('Attempting to insert product:', { name, branch_id, sku, variations });
            const insertProductQuery = 'INSERT INTO products (name, branch_id, sku, is_serialized) VALUES ($1, $2, $3, $4) RETURNING id';
            const insertProductValues = [name, branch_id, sku, is_serialized || false];
            console.log('Product INSERT query:', insertProductQuery, 'values:', insertProductValues);
            const productResult = await pool.query(insertProductQuery, insertProductValues);
            const newProductId = productResult.rows[0].id;
            console.log('Product inserted, newProductId:', newProductId);
            const variationValues = variations
                .map((v) => `('${newProductId}', '${v.color}', '${v.storage_capacity || ''}', ${v.price}, ${v.stock_quantity}, ${v.low_stock_threshold || 0})`)
                .join(',');
            if (variationValues) {
                console.log('Generated variationValues SQL:', variationValues);
                console.log('Attempting to insert product variations:', variationValues);
                await pool.query(`INSERT INTO product_variations (product_id, color, storage_capacity, price, stock_quantity, low_stock_threshold) VALUES ${variationValues}`);
                console.log('Product variations inserted.');
            }
            await pool.query('COMMIT');
            const newProduct = await this.getProductById(newProductId);
            return newProduct;
        }
        catch (error) {
            await pool.query('ROLLBACK');
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
    },
    async updateProduct(id, productData) {
        const { name, variations, is_serialized } = productData;
        const pool = getPool();
        await pool.query('BEGIN');
        try {
            const existingProduct = await this.getProductById(id);
            if (!existingProduct) {
                throw new NotFoundError('Product not found');
            }
            const productFields = [];
            const productValues = [];
            let paramIndex = 1;
            if (name !== undefined) {
                productFields.push(`name = $${paramIndex++}`);
                productValues.push(name);
            }
            if (is_serialized !== undefined) {
                productFields.push(`is_serialized = $${paramIndex++}`);
                productValues.push(is_serialized);
            }
            if (productFields.length > 0) {
                productValues.push(id);
                await pool.query(`UPDATE products SET ${productFields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex}`, productValues);
            }
            if (variations) {
                const existingVariationsResult = await pool.query('SELECT id FROM product_variations WHERE product_id = $1', [id]);
                const existingVariationIds = new Set(existingVariationsResult.rows.map((r) => r.id));
                const incomingVariationIds = new Set(variations.filter((v) => v.id).map((v) => v.id));
                const idsToDelete = [...existingVariationIds].filter((existingId) => !incomingVariationIds.has(existingId));
                if (idsToDelete.length > 0) {
                    await pool.query('DELETE FROM product_variations WHERE id = ANY($1::int[])', [
                        idsToDelete,
                    ]);
                }
                for (const variation of variations) {
                    if (variation.id && existingVariationIds.has(variation.id)) {
                        // Fetch old price before updating
                        const oldVariationResult = await pool.query('SELECT price FROM product_variations WHERE id = $1', [variation.id]);
                        const oldPrice = oldVariationResult.rows[0]?.price;
                        await pool.query('UPDATE product_variations SET color = $1, storage_capacity = $2, price = $3, stock_quantity = $4, low_stock_threshold = $5 WHERE id = $6', [
                            variation.color,
                            variation.storage_capacity || '',
                            variation.price,
                            variation.stock_quantity,
                            variation.low_stock_threshold || 0,
                            variation.id,
                        ]);
                        // Record price change if price is different
                        if (oldPrice !== undefined && oldPrice !== variation.price) {
                            await pool.query('INSERT INTO product_price_history (product_id, variation_id, old_price, new_price) VALUES ($1, $2, $3, $4)', [id, variation.id, oldPrice, variation.price]);
                        }
                    }
                    else if (!variation.id) {
                        await pool.query('INSERT INTO product_variations (product_id, color, storage_capacity, price, stock_quantity, low_stock_threshold) VALUES ($1, $2, $3, $4, $5, $6)', [
                            id,
                            variation.color,
                            variation.storage_capacity || '',
                            variation.price,
                            variation.stock_quantity,
                            variation.low_stock_threshold || 0,
                        ]);
                    }
                }
            }
            const updatedProduct = await this.getProductById(id);
            await pool.query('COMMIT');
            return updatedProduct;
        }
        catch (error) {
            await pool.query('ROLLBACK');
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
    },
    async deleteProduct(id) {
        const pool = getPool(); // Add this line
        await pool.query('DELETE FROM product_variations WHERE product_id = $1', [id]);
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        return (result?.rowCount ?? 0) > 0;
    },
    async getProductPriceHistory(productId, variationId) {
        const pool = getPool(); // Add this line
        const result = await pool.query('SELECT * FROM product_price_history WHERE product_id = $1 AND variation_id = $2 ORDER BY changed_at DESC', [productId, variationId]);
        return result.rows;
    },
    // Nova função para obter preço sugerido de seminovos
    async getSuggestedUsedProductPrice(productId) {
        return dynamicPricingService.getSuggestedUsedProductPrice(productId);
    },
};
