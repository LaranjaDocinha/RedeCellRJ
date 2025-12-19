import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

interface QuoteItemInput {
  product_id: number;
  variation_id: number;
  quantity: number;
  unit_price: number;
}

interface CreateQuotePayload {
  customer_id: number;
  user_id: number;
  valid_until: string; // Data de validade do orçamento
  items: QuoteItemInput[];
  notes?: string;
}

interface UpdateQuotePayload {
  customer_id?: number;
  user_id?: number;
  valid_until?: string;
  items?: QuoteItemInput[];
  notes?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export const quoteService = {
  async createQuote(payload: CreateQuotePayload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { customer_id, user_id, valid_until, items, notes } = payload;

      const quoteResult = await client.query(
        'INSERT INTO quotes (customer_id, user_id, valid_until, notes) VALUES ($1, $2, $3, $4) RETURNING *',
        [customer_id, user_id, valid_until, notes],
      );
      const newQuote = quoteResult.rows[0];

      for (const item of items) {
        await client.query(
          'INSERT INTO quote_items (quote_id, product_id, variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)',
          [newQuote.id, item.product_id, item.variation_id, item.quantity, item.unit_price],
        );
      }

      await client.query('COMMIT');
      return newQuote;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async getQuoteById(id: number) {
    const quoteResult = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (quoteResult.rows.length === 0) return null;

    const quote = quoteResult.rows[0];
    const itemsResult = await pool.query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
    quote.items = itemsResult.rows;

    return quote;
  },

  async getAllQuotes() {
    const result = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
    return result.rows;
  },

  async updateQuote(id: number, payload: UpdateQuotePayload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { customer_id, user_id, valid_until, items, notes, status } = payload;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (customer_id !== undefined) {
        fields.push(`customer_id = $${paramIndex++}`);
        values.push(customer_id);
      }
      if (user_id !== undefined) {
        fields.push(`user_id = $${paramIndex++}`);
        values.push(user_id);
      }
      if (valid_until !== undefined) {
        fields.push(`valid_until = $${paramIndex++}`);
        values.push(valid_until);
      }
      if (notes !== undefined) {
        fields.push(`notes = $${paramIndex++}`);
        values.push(notes);
      }
      if (status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(status);
      }

      if (fields.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE quotes SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`,
          values,
        );
      }

      if (items !== undefined) {
        await client.query('DELETE FROM quote_items WHERE quote_id = $1', [id]);
        for (const item of items) {
          await client.query(
            'INSERT INTO quote_items (quote_id, product_id, variation_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)',
            [id, item.product_id, item.variation_id, item.quantity, item.unit_price],
          );
        }
      }

      const updatedQuote = await this.getQuoteById(id);
      await client.query('COMMIT');
      return updatedQuote;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteQuote(id: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM quote_items WHERE quote_id = $1', [id]);
      const result = await pool.query('DELETE FROM quotes WHERE id = $1 RETURNING id', [id]);
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
  },
};
