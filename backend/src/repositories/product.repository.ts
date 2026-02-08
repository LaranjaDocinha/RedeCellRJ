import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface Product {
  id: number;
  name: string;
  sku: string;
  branch_id: number;
  is_serialized: boolean;
  created_at: Date;
  updated_at: Date;
  variations?: ProductVariation[];
}

export interface ProductVariation {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  color?: string; // Derived from name usually or separate col
}

export interface PaginatedProducts {
  products: Product[];
  totalCount: number;
}

export interface GetProductOptions {
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

export class ProductRepository {
  private get db(): Pool {
    return getPool();
  }

  async count(options: GetProductOptions): Promise<number> {
    const { whereClause, queryParams } = this.buildWhereClause(options);
    const query = `
      SELECT COUNT(DISTINCT p.id)
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      ${whereClause};
    `;
    const result = await this.db.query(query, queryParams);
    return parseInt(result.rows[0].count, 10);
  }

  async findAll(options: GetProductOptions): Promise<Product[]> {
    const { whereClause, queryParams } = this.buildWhereClause(options);
    const { sortBy = 'name', sortDirection = 'ASC', limit = 10, offset = 0 } = options;

    // Add pagination params
    const nextParamIndex = queryParams.length + 1;

    const query = `
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
      LIMIT $${nextParamIndex} OFFSET $${nextParamIndex + 1};
    `;

    const result = await this.db.query(query, [...queryParams, limit, offset]);
    return result.rows;
  }

  async findAllVariations(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT pv.id, pv.sku, p.name as product_name, pv.name as variation_name
       FROM product_variations pv
       JOIN products p ON pv.product_id = p.id`,
    );
    return result.rows;
  }

  async findById(id: number, branchId?: number): Promise<Product | null> {
    const productResult = await this.db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productResult.rowCount === 0) return null;

    const product = productResult.rows[0];
    const targetBranchId = branchId || product.branch_id;

    const variationsResult = await this.db.query(
      `SELECT pv.*,
              COALESCE(bpvs.stock_quantity, 0) as stock_quantity,
              COALESCE(bpvs.min_stock_level, 0) as low_stock_threshold
       FROM product_variations pv
       LEFT JOIN branch_product_variations_stock bpvs ON pv.id = bpvs.product_variation_id AND bpvs.branch_id = $2
       WHERE pv.product_id = $1`,
      [id, targetBranchId],
    );

    product.variations = variationsResult.rows;
    return product;
  }

  async createProduct(data: Partial<Product>, client: PoolClient): Promise<number> {
    const insertProductQuery =
      'INSERT INTO products (name, branch_id, sku, is_serialized) VALUES ($1, $2, $3, $4) RETURNING id';
    const result = await client.query(insertProductQuery, [
      data.name,
      data.branch_id,
      data.sku,
      data.is_serialized || false,
    ]);
    return result.rows[0].id;
  }

  async createVariation(data: any, client: PoolClient): Promise<number> {
    const insertVariationQuery = `
        INSERT INTO product_variations (product_id, name, sku, price, cost_price)
        VALUES ($1, $2, $3, $4, 0)
        RETURNING id
    `;
    const result = await client.query(insertVariationQuery, [
      data.product_id,
      data.name,
      data.sku,
      data.price,
    ]);
    return result.rows[0].id;
  }

  async createOrUpdateStock(data: any, client: PoolClient): Promise<void> {
    const check = await client.query(
      'SELECT 1 FROM branch_product_variations_stock WHERE branch_id = $1 AND product_variation_id = $2',
      [data.branch_id, data.product_variation_id],
    );

    if (check.rowCount && check.rowCount > 0) {
      await client.query(
        'UPDATE branch_product_variations_stock SET stock_quantity = $1, min_stock_level = $2 WHERE branch_id = $3 AND product_variation_id = $4',
        [data.stock_quantity, data.min_stock_level, data.branch_id, data.product_variation_id],
      );
    } else {
      await client.query(
        'INSERT INTO branch_product_variations_stock (branch_id, product_variation_id, stock_quantity, min_stock_level) VALUES ($1, $2, $3, $4)',
        [data.branch_id, data.product_variation_id, data.stock_quantity, data.min_stock_level],
      );
    }
  }

  async updateProduct(
    id: number,
    fields: string[],
    values: any[],
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${values.length + 1}`,
      [...values, id],
    );
  }

  async getVariationIds(productId: number, client: PoolClient): Promise<number[]> {
    const result = await client.query('SELECT id FROM product_variations WHERE product_id = $1', [
      productId,
    ]);
    return result.rows.map((r) => r.id);
  }

  async deleteVariations(ids: number[], client: PoolClient): Promise<void> {
    await client.query('DELETE FROM product_variations WHERE id = ANY($1::int[])', [ids]);
  }

  async getVariationPrice(id: number, client: PoolClient): Promise<number | undefined> {
    const result = await client.query('SELECT price FROM product_variations WHERE id = $1', [id]);
    return result.rows[0]?.price;
  }

  async updateVariation(
    id: number,
    name: string,
    price: number,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      'UPDATE product_variations SET name = $1, price = $2, updated_at = current_timestamp WHERE id = $3',
      [name, price, id],
    );
  }

  async recordPriceHistory(
    variationId: number,
    oldPrice: number,
    newPrice: number,
    reason: string,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      'INSERT INTO price_history (variation_id, old_price, new_price, reason) VALUES ($1, $2, $3, $4)',
      [variationId, oldPrice, newPrice, reason],
    );
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getPriceHistory(variationId: number): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM price_history WHERE variation_id = $1 ORDER BY created_at DESC',
      [variationId],
    );
    return result.rows;
  }

  // Métodos de Suporte a Vendas (Sales Support)
  async findVariationWithStockForUpdate(
    variationId: number,
    branchId: number,
    client: PoolClient,
  ): Promise<any> {
    const { rows } = await client.query(
      `SELECT pv.price, ps.stock_quantity, pv.cost_price, p.is_serialized 
       FROM product_variations pv 
       JOIN branch_product_variations_stock ps ON pv.id = ps.product_variation_id 
       JOIN products p ON pv.product_id = p.id
       WHERE pv.id = $1 AND ps.branch_id = $2 FOR UPDATE`,
      [variationId, branchId],
    );
    return rows[0];
  }

  async findSerializedItemForUpdate(
    serialNumber: string,
    variationId: number,
    branchId: number,
    client: PoolClient,
  ): Promise<any> {
    const { rows } = await client.query(
      `SELECT id, status FROM serialized_items WHERE serial_number = $1 AND product_variation_id = $2 AND branch_id = $3 FOR UPDATE`,
      [serialNumber, variationId, branchId],
    );
    return rows[0];
  }

  async updateSerializedItemStatus(id: number, status: string, client: PoolClient): Promise<void> {
    await client.query(
      `UPDATE serialized_items SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id],
    );
  }

  async logSerializedItemHistory(data: any, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO serialized_items_history (serialized_item_id, action, old_status, new_status, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        data.serialized_item_id,
        data.action,
        data.old_status,
        data.new_status,
        data.user_id,
        data.details,
      ],
    );
  }

  async getProductStats(productId: number): Promise<any> {
    const { rows } = await this.db.query(
      `SELECT
           p.name AS product_name,
           pv.price AS current_price,
           pv.cost_price,
           pv.storage_capacity,
           pv.color,
           (SELECT AVG(si.unit_price) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.product_id = p.id AND s.sale_date > NOW() - INTERVAL '90 days') AS avg_sales_price_90d,
           (SELECT COUNT(si.id) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.product_id = p.id AND s.sale_date > NOW() - INTERVAL '90 days') AS sales_count_90d
         FROM products p
         JOIN product_variations pv ON p.id = pv.product_id
         WHERE p.id = $1 LIMIT 1`,
      [productId],
    );
    return rows[0];
  }

  // Helper to build dynamic WHERE clauses
  private buildWhereClause(options: GetProductOptions) {
    const { search, categoryId, branchId, isSerialized, minPrice, maxPrice } = options;

    const queryParams: any[] = [];
    let whereClause = 'WHERE 1=1';
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    if (categoryId) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
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
      whereClause += ` AND pv.price >= $${paramIndex}`;
      queryParams.push(minPrice);
      paramIndex++;
    }
    if (maxPrice) {
      whereClause += ` AND pv.price <= $${paramIndex}`;
      queryParams.push(maxPrice);
      paramIndex++;
    }
    return { whereClause, queryParams };
  }
}

export const productRepository = new ProductRepository();
