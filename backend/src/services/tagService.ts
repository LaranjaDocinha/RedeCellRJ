import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateTagPayload {
  name: string;
  color?: string;
}

interface UpdateTagPayload {
  name?: string;
  color?: string;
}

class TagService {
  async getAllTags(): Promise<Tag[]> {
    const result = await pool.query('SELECT * FROM tags ORDER BY name ASC');
    return result.rows;
  }

  async getTagById(id: number): Promise<Tag | undefined> {
    const result = await pool.query('SELECT * FROM tags WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createTag(payload: CreateTagPayload): Promise<Tag> {
    const { name, color = '#1976d2' } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *', 
        [name, color]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === '23505') {
        throw new AppError('Já existe uma tag com este nome', 409);
      }
      throw error;
    }
  }

  async updateTag(id: number, payload: UpdateTagPayload): Promise<Tag | undefined> {
    const { name, color } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (color !== undefined) {
      fields.push(`color = $${paramIndex++}`);
      values.push(color);
    }

    if (fields.length === 0) return this.getTagById(id);

    values.push(id);
    const query = `UPDATE tags SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === '23505') {
        throw new AppError('Já existe uma tag com este nome', 409);
      }
      throw error;
    }
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const tagService = new TagService();
