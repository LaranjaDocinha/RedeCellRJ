import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateCategoryPayload {
  name: string;
  description?: string;
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const result = await pool.query('SELECT * FROM categories');
    return result.rows;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const { name, description } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation error code
        throw new AppError('Category with this name already exists', 409);
      }
      throw error;
    }
  }

  async updateCategory(id: number, payload: UpdateCategoryPayload): Promise<Category | undefined> {
    const { name, description } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }

    if (fields.length === 0) {
      const existingCategory = await this.getCategoryById(id);
      if (!existingCategory) {
        return undefined; // No category found to update
      }
      return existingCategory; // No fields to update, return existing category
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE categories SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation error code
        throw new AppError('Category with this name already exists', 409);
      }
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const categoryService = new CategoryService();