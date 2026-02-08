import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface Sale {
  id: number;
  user_id?: string;
  customer_id?: string;
  total_amount: number;
  external_order_id?: string;
  marketplace_integration_id?: number;
  sale_date: Date;
  items?: SaleItem[];
  payments?: SalePayment[];
}

export interface SaleItem {
  id?: number;
  sale_id: number;
  product_id: number;
  variation_id: number;
  quantity: number;
  unit_price: number;
  cost_price: number;
  total_price: number;
  metadata?: any;
}

export interface SalePayment {
  id?: number;
  sale_id: number;
  payment_method: string;
  amount: number;
  transaction_details?: any;
}

export class SaleRepository {
  private get db(): Pool {
    return getPool();
  }

  async create(data: Partial<Sale>, client: PoolClient): Promise<Sale> {
    const { rows } = await client.query(
      'INSERT INTO sales (user_id, customer_id, total_amount, external_order_id, marketplace_integration_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, sale_date',
      [
        data.user_id,
        data.customer_id,
        data.total_amount,
        data.external_order_id,
        data.marketplace_integration_id,
      ],
    );
    return { ...data, ...rows[0] } as Sale;
  }

  async addItem(data: SaleItem, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, unit_price, cost_price, total_price, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        data.sale_id,
        data.product_id,
        data.variation_id,
        data.quantity,
        data.unit_price,
        data.cost_price,
        data.total_price,
        data.metadata,
      ],
    );
  }

  async addPayment(data: SalePayment, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO sale_payments (sale_id, payment_method, amount, transaction_details) VALUES ($1, $2, $3, $4)',
      [data.sale_id, data.payment_method, data.amount, data.transaction_details],
    );
  }

  async findById(id: number): Promise<Sale | null> {
    const saleRes = await this.db.query('SELECT * FROM sales WHERE id = $1', [id]);
    if (saleRes.rows.length === 0) return null;

    const sale = saleRes.rows[0];
    const itemsRes = await this.db.query('SELECT * FROM sale_items WHERE sale_id = $1', [id]);
    const paymentsRes = await this.db.query('SELECT * FROM sale_payments WHERE sale_id = $1', [id]);

    return {
      ...sale,
      items: itemsRes.rows,
      payments: paymentsRes.rows,
    };
  }

  async findAll(): Promise<Sale[]> {
    const result = await this.db.query('SELECT * FROM sales ORDER BY sale_date DESC');
    return result.rows;
  }
}

export const saleRepository = new SaleRepository();
