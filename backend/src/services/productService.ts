import pool from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';

interface ProductVariationInput {
  id?: number;
  color: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold?: number; // Add low_stock_threshold
}

interface ProductCreateInput {
  name: string;
  branch_id: number;
  sku: string;
  product_type: string;
  variations: ProductVariationInput[];
}

interface ProductUpdateInput {
  name?: string;
  branch_id?: number;
  variations?: ProductVariationInput[];
}

export const productService = {
  async getAllProducts() {
    const result = await pool.query(
      'SELECT id, name, description, sku, branch_id FROM products ORDER BY name ASC',
    );
    return result.rows;
  },

  async getProductById(id: number) {
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [
      id,
    ]);
    if (productResult.rowCount === 0) {
      return null;
    }
    const variationsResult = await pool.query(
      'SELECT * FROM product_variations WHERE product_id = $1',
      [id],
    );
    const product = productResult.rows[0];
    product.variations = variationsResult.rows;
    return product;
  },

  async createProduct(productData: ProductCreateInput) {
    const { name, branch_id, sku, product_type, variations } = productData;

    await pool.query('BEGIN');
    try {
      const productResult = await pool.query(
        'INSERT INTO products (name, branch_id, sku, product_type) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, branch_id, sku, product_type],
      );
      const newProductId = productResult.rows[0].id;

      const variationValues = variations
        .map(
          v =>
            `(${newProductId}, '${v.color}', ${v.price}, ${v.stock_quantity}, ${v.low_stock_threshold || 0})`,
        )
        .join(',');

      if (variationValues) {
        await pool.query(
          `INSERT INTO product_variations (product_id, color, price, stock_quantity, low_stock_threshold) VALUES ${variationValues}`,
        );
      }

      await pool.query('COMMIT');
      const newProduct = await this.getProductById(newProductId);
      return newProduct;
    } catch (error: unknown) {
      await pool.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  },

  async updateProduct(id: number, productData: ProductUpdateInput) {
    const { name, variations } = productData;

    await pool.query('BEGIN');
    try {
      if (name) {
        await pool.query('UPDATE products SET name = $1 WHERE id = $2', [name, id]);
      }

      if (variations) {
        const existingVariationsResult = await pool.query(
          'SELECT id FROM product_variations WHERE product_id = $1',
          [id],
        );
        const existingVariationIds = new Set(existingVariationsResult.rows.map(r => r.id));
        const incomingVariationIds = new Set(variations.filter(v => v.id).map(v => v.id as number));

        const idsToDelete = [...existingVariationIds].filter(existingId => !incomingVariationIds.has(existingId));
        if (idsToDelete.length > 0) {
          await pool.query('DELETE FROM product_variations WHERE id = ANY($1::int[])', [idsToDelete]);
        }

        for (const variation of variations) {
          if (variation.id && existingVariationIds.has(variation.id)) {
            // Fetch old price before updating
            const oldVariationResult = await pool.query(
              'SELECT price FROM product_variations WHERE id = $1',
              [variation.id],
            );
            const oldPrice = oldVariationResult.rows[0]?.price;

            await pool.query(
              'UPDATE product_variations SET color = $1, price = $2, stock_quantity = $3, low_stock_threshold = $4 WHERE id = $5',
              [variation.color, variation.price, variation.stock_quantity, variation.low_stock_threshold || 0, variation.id],
            );

            // Record price change if price is different
            if (oldPrice !== undefined && oldPrice !== variation.price) {
              await pool.query(
                'INSERT INTO product_price_history (product_id, variation_id, old_price, new_price) VALUES ($1, $2, $3, $4)',
                [id, variation.id, oldPrice, variation.price],
              );
            }
          } else if (!variation.id) {
            await pool.query(
              'INSERT INTO product_variations (product_id, color, price, stock_quantity, low_stock_threshold) VALUES ($1, $2, $3, $4, $5)',
              [id, variation.color, variation.price, variation.stock_quantity, variation.low_stock_threshold || 0],
            );
          }
        }
      }

      const updatedProduct = await this.getProductById(id);
      await pool.query('COMMIT');
      return updatedProduct;
    } catch (error: unknown) {
      await pool.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  },

  async deleteProduct(id: number) {
    await pool.query('DELETE FROM product_variations WHERE product_id = $1', [id]);
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (result?.rowCount ?? 0) > 0;
  },

  async getProductPriceHistory(productId: number, variationId: number) {
    const result = await pool.query(
      'SELECT * FROM product_price_history WHERE product_id = $1 AND variation_id = $2 ORDER BY changed_at DESC',
      [productId, variationId],
    );
    return result.rows;
  },
};
