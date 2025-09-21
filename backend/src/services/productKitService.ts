import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface ProductKitItem {
  product_id: number;
  variation_id: number;
  quantity: number;
}

interface ProductKit {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  items?: ProductKitItem[];
}

interface CreateProductKitPayload {
  name: string;
  description?: string;
  price: number;
  is_active?: boolean;
  items: ProductKitItem[];
}

interface UpdateProductKitPayload {
  name?: string;
  description?: string;
  price?: number;
  is_active?: boolean;
  items?: ProductKitItem[];
}

class ProductKitService {
  async getAllProductKits(): Promise<ProductKit[]> {
    const result = await pool.query('SELECT * FROM product_kits');
    return result.rows;
  }

  async getProductKitById(id: number): Promise<ProductKit | undefined> {
    const kitResult = await pool.query('SELECT * FROM product_kits WHERE id = $1', [id]);
    if (kitResult.rows.length === 0) return undefined;

    const kit = kitResult.rows[0];
    const itemsResult = await pool.query('SELECT product_id, variation_id, quantity FROM product_kit_items WHERE kit_id = $1', [id]);
    kit.items = itemsResult.rows;

    return kit;
  }

  async createProductKit(payload: CreateProductKitPayload): Promise<ProductKit> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { name, description, price, is_active, items } = payload;

      const kitResult = await client.query(
        'INSERT INTO product_kits (name, description, price, is_active) VALUES ($1, $2, $3, $4) RETURNING *'
        , [name, description, price, is_active]
      );
      const newKit = kitResult.rows[0];

      for (const item of items) {
        await client.query(
          'INSERT INTO product_kit_items (kit_id, product_id, variation_id, quantity) VALUES ($1, $2, $3, $4)',
          [newKit.id, item.product_id, item.variation_id, item.quantity]
        );
      }

      await client.query('COMMIT');
      return newKit;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async updateProductKit(id: number, payload: UpdateProductKitPayload): Promise<ProductKit | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { name, description, price, is_active, items } = payload;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
      if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
      if (price !== undefined) { fields.push(`price = $${paramIndex++}`); values.push(price); }
      if (is_active !== undefined) { fields.push(`is_active = $${paramIndex++}`); values.push(is_active); }

      if (fields.length > 0) {
        values.push(id); // Add id for WHERE clause
        const query = `UPDATE product_kits SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        await client.query(query, values);
      }

      if (items !== undefined) {
        // Delete existing kit items
        await client.query('DELETE FROM product_kit_items WHERE kit_id = $1', [id]);
        // Insert new kit items
        for (const item of items) {
          await client.query(
            'INSERT INTO product_kit_items (kit_id, product_id, variation_id, quantity) VALUES ($1, $2, $3, $4)',
            [id, item.product_id, item.variation_id, item.quantity]
          );
        }
      }

      const updatedKit = await this.getProductKitById(id);
      await client.query('COMMIT');
      return updatedKit;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteProductKit(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM product_kit_items WHERE kit_id = $1', [id]);
      const result = await client.query('DELETE FROM product_kits WHERE id = $1 RETURNING id', [id]);
      await client.query('COMMIT');
      return (result?.rowCount ?? 0) > 0;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

export const productKitService = new ProductKitService();