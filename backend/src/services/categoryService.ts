import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  slug?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateCategoryPayload {
  name: string;
  description?: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  slug?: string;
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  slug?: string;
}

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const { name, description, parent_id, icon, color, slug } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO categories (name, description, parent_id, icon, color, slug) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, parent_id || null, icon, color, slug],
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new AppError('Category with this name or slug already exists', 409);
      }
      throw error;
    }
  }

  async updateCategory(id: number, payload: UpdateCategoryPayload): Promise<Category | undefined> {
    const { name, description, parent_id, icon, color, slug } = payload;
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
    if (parent_id !== undefined) {
      fields.push(`parent_id = $${paramIndex++}`);
      values.push(parent_id || null);
    }
    if (icon !== undefined) {
      fields.push(`icon = $${paramIndex++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      fields.push(`color = $${paramIndex++}`);
      values.push(color);
    }
    if (slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }

    if (fields.length === 0) {
      const existingCategory = await this.getCategoryById(id);
      if (!existingCategory) return undefined;
      return existingCategory;
    }

    values.push(id);
    const query = `UPDATE categories SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new AppError('Category with this name or slug already exists', 409);
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
