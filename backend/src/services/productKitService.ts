import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { inventoryService } from './inventoryService.js'; // Importar o serviço de inventário

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
    const query = `
      SELECT pk.*, 
             COALESCE(SUM(pki.quantity * pv.cost_price), 0) as total_cost,
             COUNT(pki.id) as items_count
      FROM product_kits pk
      LEFT JOIN product_kit_items pki ON pk.id = pki.kit_id
      LEFT JOIN product_variations pv ON pki.variation_id = pv.id
      GROUP BY pk.id
      ORDER BY pk.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async getProductKitById(id: number): Promise<ProductKit | undefined> {
    const kitResult = await pool.query('SELECT * FROM product_kits WHERE id = $1', [id]);
    if (kitResult.rows.length === 0) return undefined;

    const kit = kitResult.rows[0];
    const itemsResult = await pool.query(
      'SELECT product_id, variation_id, quantity FROM product_kit_items WHERE kit_id = $1',
      [id],
    );
    kit.items = itemsResult.rows;

    return kit;
  }

  async createProductKit(payload: CreateProductKitPayload): Promise<ProductKit> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { name, description, price, is_active, items } = payload;

      const kitResult = await client.query(
        'INSERT INTO product_kits (name, description, price, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, price, is_active],
      );
      const newKit = kitResult.rows[0];

      for (const item of items) {
        await client.query(
          'INSERT INTO product_kit_items (kit_id, product_id, variation_id, quantity) VALUES ($1, $2, $3, $4)',
          [newKit.id, item.product_id, item.variation_id, item.quantity],
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

  async updateProductKit(
    id: number,
    payload: UpdateProductKitPayload,
  ): Promise<ProductKit | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { name, description, price, is_active, items } = payload;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (price !== undefined) {
        fields.push(`price = $${paramIndex++}`);
        values.push(price);
      }
      if (is_active !== undefined) {
        fields.push(`is_active = $${paramIndex++}`);
        values.push(is_active);
      }

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
            [id, item.product_id, item.variation_id, item.quantity],
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
      const result = await pool.query('DELETE FROM product_kits WHERE id = $1 RETURNING id', [id]);
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

  async kitProducts(kitId: number, quantity: number, userId: string, branchId: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const kit = await this.getProductKitById(kitId);
      if (!kit) {
        throw new AppError('Product kit not found', 404);
      }
      if (!kit.items || kit.items.length === 0) {
        throw new AppError('Product kit has no items defined', 400);
      }

      for (const kitItem of kit.items) {
        const requiredQuantity = kitItem.quantity * quantity;
        const stockRes = await client.query(
          'SELECT stock_quantity FROM product_variations WHERE id = $1 AND branch_id = $2 FOR UPDATE',
          [kitItem.variation_id, branchId],
        );

        if (stockRes.rows.length === 0) {
          throw new AppError(
            `Product variation ${kitItem.variation_id} not found in branch ${branchId}`,
            404,
          );
        }
        if (stockRes.rows[0].stock_quantity < requiredQuantity) {
          throw new AppError(
            `Insufficient stock for ${kitItem.product_id} (${kitItem.variation_id}). Required: ${requiredQuantity}, Available: ${stockRes.rows[0].stock_quantity}`,
            400,
          );
        }

        // Deduzir estoque dos itens individuais
        await client.query(
          'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [requiredQuantity, kitItem.variation_id],
        );

        // Registrar movimento de inventário
        await inventoryService.adjustStock(
          kitItem.variation_id,
          -requiredQuantity,
          'kitting',
          userId,
          client,
        );
      }

      await client.query('COMMIT');
      return { message: `${quantity} kits of ${kit.name} kitted successfully.` };
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

  async dekitProducts(kitId: number, quantity: number, userId: string, branchId: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const kit = await this.getProductKitById(kitId);
      if (!kit) {
        throw new AppError('Product kit not found', 404);
      }
      if (!kit.items || kit.items.length === 0) {
        throw new AppError('Product kit has no items defined', 400);
      }

      for (const kitItem of kit.items) {
        const returnedQuantity = kitItem.quantity * quantity;

        // Adicionar estoque aos itens individuais
        await client.query(
          'UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [returnedQuantity, kitItem.variation_id],
        );

        // Registrar movimento de inventário
        await inventoryService.adjustStock(
          kitItem.variation_id,
          returnedQuantity,
          'de-kitting',
          userId,
          client,
        );
      }

      await client.query('COMMIT');
      return { message: `${quantity} kits of ${kit.name} de-kitted successfully.` };
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
