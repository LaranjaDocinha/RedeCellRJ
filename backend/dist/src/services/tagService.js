import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
class TagService {
    async getAllTags() {
        const result = await pool.query('SELECT * FROM tags');
        return result.rows;
    }
    async getTagById(id) {
        const result = await pool.query('SELECT * FROM tags WHERE id = $1', [id]);
        return result.rows[0];
    }
    async createTag(payload) {
        const { name } = payload;
        try {
            const result = await pool.query('INSERT INTO tags (name) VALUES ($1) RETURNING *', [name]);
            return result.rows[0];
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('Tag with this name already exists', 409);
            }
            throw error;
        }
    }
    async updateTag(id, payload) {
        const { name } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (fields.length === 0) {
            const existingTag = await this.getTagById(id);
            if (!existingTag) {
                return undefined; // No tag found to update
            }
            return existingTag; // No fields to update, return existing tag
        }
        values.push(id); // Add id for WHERE clause
        const query = `UPDATE tags SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('Tag with this name already exists', 409);
            }
            throw error;
        }
    }
    async deleteTag(id) {
        const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);
        return (result?.rowCount ?? 0) > 0;
    }
}
export const tagService = new TagService();
