import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateReviewPayload {
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
}

interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

class ReviewService {
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    const result = await pool.query(
      'SELECT pr.*, u.email as user_email, u.name as user_name FROM product_reviews pr JOIN users u ON pr.user_id = u.id WHERE pr.product_id = $1 ORDER BY pr.created_at DESC',
      [productId],
    );
    return result.rows;
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    const result = await pool.query('SELECT * FROM product_reviews WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createReview(payload: CreateReviewPayload): Promise<Review> {
    const { product_id, user_id, rating, comment } = payload;
    try {
      // Check if user has already reviewed this product
      const existingReview = await pool.query(
        'SELECT id FROM product_reviews WHERE product_id = $1 AND user_id = $2',
        [product_id, user_id],
      );
      if (existingReview.rows.length > 0) {
        throw new AppError('You have already reviewed this product', 409);
      }

      const result = await pool.query(
        'INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
        [product_id, user_id, rating, comment],
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        // Unique violation error code
        throw new AppError('You have already reviewed this product', 409);
      }
      throw error;
    }
  }

  async updateReview(
    id: number,
    userId: number,
    payload: UpdateReviewPayload,
  ): Promise<Review | undefined> {
    const { rating, comment } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (rating !== undefined) {
      fields.push(`rating = $${paramIndex++}`);
      values.push(rating);
    }
    if (comment !== undefined) {
      fields.push(`comment = $${paramIndex++}`);
      values.push(comment);
    }

    if (fields.length === 0) {
      const existingReview = await this.getReviewById(id);
      if (!existingReview || existingReview.user_id !== userId) {
        return undefined; // Not found or not authorized
      }
      return existingReview; // No fields to update, return existing review
    }

    values.push(id); // Add id for WHERE clause
    values.push(userId); // Add userId for authorization check
    const query = `UPDATE product_reviews SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  }

  async deleteReview(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM product_reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId],
    );
    return (result?.rowCount ?? 0) > 0;
  }
}

export const reviewService = new ReviewService();
