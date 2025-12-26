import { getPool } from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { dynamicPricingService } from './dynamicPricingService.js'; // Importar o novo serviço
import redisClient from '../utils/redisClient.js'; // Importar redisClient
import crypto from 'crypto';

interface ProductVariationInput {
  id?: number;
  color: string;
  storage_capacity?: string; // Added field
  price: number;
  stock_quantity: number;
  low_stock_threshold?: number;
}

interface ProductCreateInput {
  name: string;
  branch_id: number;
  sku: string;
  is_serialized?: boolean; // Added
  // product_type: string; // Removido
  variations: ProductVariationInput[];
  // is_used?: boolean; // Removido
  // condition?: string; // Removido
  // acquisition_date?: string; // Removido
}

interface ProductUpdateInput {
  name?: string;
  branch_id?: number;
  is_serialized?: boolean; // Added
  variations?: ProductVariationInput[];
  // is_used?: boolean; // Removido
  // condition?: string; // Removido
  // acquisition_date?: string; // Removido
}

interface GetProductOptions {
  search?: string;
  categoryId?: number;
  branchId?: number;
  isSerialized?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

interface PaginatedProducts {
  products: any[];
  totalCount: number;
}

export const productService = {
  async getAllProducts(options: GetProductOptions = {}): Promise<PaginatedProducts> {
    const {
      search,
      categoryId,
      branchId,
      isSerialized,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortDirection = 'ASC',
      limit = 10,
      offset = 0,
    } = options;

    const pool = getPool();
    const queryParams: any[] = [];
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
    console.log('getAllProducts countQuery:', countQuery);
    console.log('getAllProducts queryParams:', queryParams);
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    const productsQuery = `
      SELECT
        p.id, p.name, p.sku, p.branch_id, p.is_serialized,
        json_agg(
          json_build_object(
            'id', pv.id,
            'name', pv.name,
            'sku', pv.sku,
            'price', pv.price,
            'stock_quantity', COALESCE(bpvs.stock_quantity, 0),
            'min_stock_level', COALESCE(bpvs.min_stock_level, 0)
          )
        ) as variations
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN branch_product_variations_stock bpvs ON pv.id = bpvs.product_variation_id AND bpvs.branch_id = p.branch_id
      ${whereClause}
      GROUP BY p.id, p.name, p.sku, p.branch_id, p.is_serialized
      ORDER BY p.${sortBy} ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    queryParams.push(limit, offset);
    console.log('getAllProducts productsQuery:', productsQuery);
    console.log('getAllProducts queryParams with limit/offset:', queryParams);

    try {
      const result = await pool.query(productsQuery, queryParams);
      console.log('getAllProducts result.rowCount:', result.rowCount);
      return { products: result.rows, totalCount };
    } catch (error) {
      console.error('SQL Error in getAllProducts:', error);
      throw error;
    }
  },

  async getAllProductVariations(): Promise<any[]> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT pv.id, pv.sku, p.name as product_name, pv.name as variation_name
       FROM product_variations pv
       JOIN products p ON pv.product_id = p.id`
    );
    // Formatar para { id, sku, name } onde name é uma combinação de produto e variação
    return result.rows.map((row: any) => ({
      id: row.id,
      sku: row.sku,
      name: `${row.product_name} (${row.variation_name || row.sku})`,
    }));
  },

  async getProductById(id: number) {
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
    // Updated query to join with stock table
    const variationsResult = await pool.query(
      `SELECT pv.*,
              COALESCE(bpvs.stock_quantity, 0) as stock_quantity,
              COALESCE(bpvs.min_stock_level, 0) as low_stock_threshold
       FROM product_variations pv
       LEFT JOIN branch_product_variations_stock bpvs ON pv.id = bpvs.product_variation_id AND bpvs.branch_id = $2
       WHERE pv.product_id = $1`,
      [id, productResult.rows[0].branch_id],
    );
    const product = productResult.rows[0];
    product.variations = variationsResult.rows;

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product)); // Cache por 1 hora
    return product;
  },

  async createProduct(productData: ProductCreateInput) {
    const { name, branch_id, sku, variations, is_serialized } = productData;

    const pool = getPool();
    const client = await pool.connect();
    let newProductId: number | undefined;

    try {
      await client.query('BEGIN');
      console.log('Attempting to insert product:', { name, branch_id, sku, variations });
      
      const insertProductQuery = 'INSERT INTO products (name, branch_id, sku, is_serialized) VALUES ($1, $2, $3, $4) RETURNING id';
      const insertProductValues = [name, branch_id, sku, is_serialized || false];
      const productResult = await client.query(insertProductQuery, insertProductValues);
      newProductId = productResult.rows[0].id;
      console.log('Product inserted, newProductId:', newProductId);

      for (const v of variations) {
        const variationName = `${v.color} ${v.storage_capacity || ''}`.trim();
        // Generate a random SKU suffix if not provided. Assumes SKU pattern.
        const variationSku = `${sku}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        
        const insertVariationQuery = `
            INSERT INTO product_variations (product_id, name, sku, price, cost_price)
            VALUES ($1, $2, $3, $4, 0)
            RETURNING id
        `;
        const variationResult = await client.query(insertVariationQuery, [
            newProductId,
            variationName,
            variationSku,
            v.price
        ]);
        const variationId = variationResult.rows[0].id;

        const insertStockQuery = `
            INSERT INTO branch_product_variations_stock (branch_id, product_variation_id, stock_quantity, min_stock_level)
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(insertStockQuery, [
            branch_id,
            variationId,
            v.stock_quantity,
            v.low_stock_threshold || 0
        ]);
      }

      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
        client.release();
    }

    if (newProductId) {
        return await this.getProductById(newProductId);
    }
    throw new Error('Failed to create product');
  },

  async updateProduct(id: number, productData: ProductUpdateInput) {
    const { name, variations, is_serialized, branch_id } = productData;

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Manual fetch using client to avoid deadlock
      const existingProductRes = await client.query('SELECT * FROM products WHERE id = $1', [id]);
      if (existingProductRes.rowCount === 0) {
        throw new NotFoundError('Product not found');
      }
      const existingProduct = existingProductRes.rows[0];
      
      // Use existing branch_id if not provided in update
      const targetBranchId = branch_id || existingProduct.branch_id;

      const productFields: string[] = [];
      const productValues: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        productFields.push(`name = $${paramIndex++}`);
        productValues.push(name);
      }
      if (is_serialized !== undefined) {
        productFields.push(`is_serialized = $${paramIndex++}`);
        productValues.push(is_serialized);
      }
      // Assuming branch_id can be updated too?
      if (branch_id !== undefined) {
        productFields.push(`branch_id = $${paramIndex++}`);
        productValues.push(branch_id);
      }

      if (productFields.length > 0) {
        productValues.push(id);
        await client.query(
          `UPDATE products SET ${productFields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex}`,
          productValues,
        );
      }

      if (variations) {
        const existingVariationsResult = await client.query(
          'SELECT id FROM product_variations WHERE product_id = $1',
          [id],
        );
        const existingVariationIds = new Set(existingVariationsResult.rows.map((r) => r.id));
        const incomingVariationIds = new Set(
          variations.filter((v) => v.id).map((v) => v.id as number),
        );

        const idsToDelete = [...existingVariationIds].filter(
          (existingId) => !incomingVariationIds.has(existingId),
        );
        if (idsToDelete.length > 0) {
          await client.query('DELETE FROM product_variations WHERE id = ANY($1::int[])', [
            idsToDelete,
          ]);
        }

        for (const variation of variations) {
           const variationName = `${variation.color} ${variation.storage_capacity || ''}`.trim();

          if (variation.id && existingVariationIds.has(variation.id)) {
            // Fetch old price before updating
            const oldVariationResult = await client.query(
              'SELECT price FROM product_variations WHERE id = $1',
              [variation.id],
            );
            const oldPrice = oldVariationResult.rows[0]?.price;

            await client.query(
              'UPDATE product_variations SET name = $1, price = $2, updated_at = current_timestamp WHERE id = $3',
              [
                variationName,
                variation.price,
                variation.id,
              ],
            );

            // Update Stock
            // Check if stock record exists
            const stockCheck = await client.query(
                'SELECT 1 FROM branch_product_variations_stock WHERE branch_id = $1 AND product_variation_id = $2',
                [targetBranchId, variation.id]
            );

            if (stockCheck.rowCount > 0) {
                 await client.query(
                    'UPDATE branch_product_variations_stock SET stock_quantity = $1, min_stock_level = $2 WHERE branch_id = $3 AND product_variation_id = $4',
                    [variation.stock_quantity, variation.low_stock_threshold || 0, targetBranchId, variation.id]
                 );
            } else {
                 await client.query(
                    'INSERT INTO branch_product_variations_stock (branch_id, product_variation_id, stock_quantity, min_stock_level) VALUES ($1, $2, $3, $4)',
                    [targetBranchId, variation.id, variation.stock_quantity, variation.low_stock_threshold || 0]
                 );
            }

            // Record price change if price is different
            if (oldPrice !== undefined && oldPrice !== variation.price) {
              await client.query(
                'INSERT INTO price_history (variation_id, old_price, new_price, reason) VALUES ($1, $2, $3, $4)',
                [variation.id, oldPrice, variation.price, 'Update via API'],
              );
            }
          } else if (!variation.id) {
             const variationSku = `${existingProduct.sku}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
             
             const insertVarResult = await client.query(
              'INSERT INTO product_variations (product_id, name, sku, price, cost_price) VALUES ($1, $2, $3, $4, 0) RETURNING id',
              [
                id,
                variationName,
                variationSku,
                variation.price,
              ],
            );
            const newVarId = insertVarResult.rows[0].id;
            
            await client.query(
                'INSERT INTO branch_product_variations_stock (branch_id, product_variation_id, stock_quantity, min_stock_level) VALUES ($1, $2, $3, $4)',
                [targetBranchId, newVarId, variation.stock_quantity, variation.low_stock_threshold || 0]
            );
          }
        }
      }

      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
        client.release();
    }

    return await this.getProductById(id);
  },

  async deleteProduct(id: number) {
    const pool = getPool(); // Add this line
    // CASCADE delete should handle variations and stock if defined in schema, 
    // but explicit delete is safer or matches logic.
    // Schema says ON DELETE CASCADE for product_variations -> products.
    // And branch_product_variations_stock -> product_variations CASCADE.
    // So deleting product should be enough.
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (result?.rowCount ?? 0) > 0;
  },

  async getProductPriceHistory(productId: number, variationId: number) {
    const pool = getPool(); // Add this line
    const result = await pool.query(
      'SELECT * FROM price_history WHERE variation_id = $1 ORDER BY created_at DESC',
      [variationId],
    );
    return result.rows;
  },

  // Nova função para obter preço sugerido de seminovos
  async getSuggestedUsedProductPrice(productId: number): Promise<number | null> {
    return dynamicPricingService.getSuggestedUsedProductPrice(productId);
  },
};