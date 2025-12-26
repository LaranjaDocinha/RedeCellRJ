import pool from '../db/index.js';

export interface Compatibility {
  id: number;
  brand: string;
  model: string;
  compatible_models: string[];
  category: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export const compatibilityService = {
  async getAll(category?: string): Promise<Compatibility[]> {
    let query = 'SELECT * FROM product_compatibilities';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY brand, model';
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async search(searchTerm: string, category: string = 'Pelicula 3D'): Promise<Compatibility[]> {
    const query = `
      SELECT * FROM product_compatibilities 
      WHERE (model ILIKE $1 OR $1 = ANY(compatible_models) OR brand ILIKE $1)
      AND category = $2
      ORDER BY brand, model
    `;
    const { rows } = await pool.query(query, [`%${searchTerm}%`, category]);
    return rows;
  },

  async create(data: Omit<Compatibility, 'id' | 'created_at' | 'updated_at'>): Promise<Compatibility> {
    const { brand, model, compatible_models, category, notes } = data;
    const { rows } = await pool.query(
      `INSERT INTO product_compatibilities (brand, model, compatible_models, category, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [brand, model, compatible_models, category, notes]
    );
    return rows[0];
  },

  async bulkCreate(items: Omit<Compatibility, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          `INSERT INTO product_compatibilities (brand, model, compatible_models, category, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [item.brand, item.model, item.compatible_models, item.category, item.notes]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};
