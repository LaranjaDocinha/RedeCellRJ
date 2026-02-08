import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface Quote {
  id: number;
  customer_id: number;
  user_id: number;
  valid_until: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  public_token?: string; // Para acesso externo
  created_at: Date;
  updated_at: Date;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id?: number;
  quote_id: number;
  product_id: number;
  variation_id: number;
  quantity: number;
  unit_price: number;
  is_optional?: boolean; // Feature nova: item opcional
  is_accepted?: boolean; // Se o cliente aceitou este item
}

export class QuoteRepository {
  private get db(): Pool {
    return getPool();
  }

  async findById(id: number): Promise<Quote | undefined> {
    const { rows } = await this.db.query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (rows.length === 0) return undefined;

    const quote = rows[0];
    const itemsRes = await this.db.query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
    quote.items = itemsRes.rows;
    return quote;
  }

  async findByToken(token: string): Promise<Quote | undefined> {
    const { rows } = await this.db.query('SELECT * FROM quotes WHERE public_token = $1', [token]);
    if (rows.length === 0) return undefined;

    const quote = rows[0];
    const itemsRes = await this.db.query('SELECT * FROM quote_items WHERE quote_id = $1', [
      quote.id,
    ]);
    quote.items = itemsRes.rows;
    return quote;
  }

  async create(data: Partial<Quote>, client: PoolClient): Promise<Quote> {
    const { rows } = await client.query(
      'INSERT INTO quotes (customer_id, user_id, valid_until, notes, status, public_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.customer_id, data.user_id, data.valid_until, data.notes, 'pending', data.public_token],
    );
    return rows[0];
  }

  async addItem(data: QuoteItem, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO quote_items (quote_id, product_id, variation_id, quantity, unit_price, is_optional, is_accepted) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        data.quote_id,
        data.product_id,
        data.variation_id,
        data.quantity,
        data.unit_price,
        data.is_optional || false,
        true,
      ],
    );
  }

  async updateStatus(id: number, status: string, client?: PoolClient): Promise<Quote> {
    const executor = client || this.db;
    const { rows } = await executor.query(
      'UPDATE quotes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id],
    );
    return rows[0];
  }

  async updateItemAcceptance(
    itemId: number,
    isAccepted: boolean,
    client: PoolClient,
  ): Promise<void> {
    await client.query('UPDATE quote_items SET is_accepted = $1 WHERE id = $2', [
      isAccepted,
      itemId,
    ]);
  }
}

export const quoteRepository = new QuoteRepository();
