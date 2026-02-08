import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface Part {
  id: number;
  name: string;
  description?: string;
  stock_quantity: number;
  cost_price: number;
  sale_price: number;
  minimum_stock_level: number;
  location?: string;
}

export class PartRepository {
  private get db(): Pool {
    return getPool();
  }

  async findById(id: number): Promise<Part | null> {
    const result = await this.db.query('SELECT * FROM parts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updateStock(id: number, quantityChange: number, client: PoolClient): Promise<void> {
    await client.query('UPDATE parts SET stock_quantity = stock_quantity + $1 WHERE id = $2', [
      quantityChange,
      id,
    ]);
  }

  async checkStock(id: number): Promise<number> {
    const result = await this.db.query('SELECT stock_quantity FROM parts WHERE id = $1', [id]);
    return result.rows[0]?.stock_quantity || 0;
  }
}

export const partRepository = new PartRepository();
