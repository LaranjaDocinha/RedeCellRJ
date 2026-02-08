import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
  store_credit_balance: string;
  loyalty_points: number;
  rfm_segment?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerFilters {
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export class CustomerRepository {
  private get db(): Pool {
    return getPool();
  }

  async findAll(): Promise<Customer[]> {
    const result = await this.db.query('SELECT * FROM customers');
    return result.rows;
  }

  async findById(id: number | string, client?: PoolClient): Promise<Customer | undefined> {
    const executor = client || this.db;
    const result = await executor.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<Customer | undefined> {
    const result = await this.db.query('SELECT * FROM customers WHERE email = $1', [email]);
    return result.rows[0];
  }

  async findByCpf(cpf: string): Promise<Customer | undefined> {
    const result = await this.db.query('SELECT * FROM customers WHERE cpf = $1', [cpf]);
    return result.rows[0];
  }

  async findWithBirthdayToday(): Promise<Customer[]> {
    const result = await this.db.query(
      'SELECT * FROM customers WHERE EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM NOW())',
    );
    return result.rows;
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const result = await this.db.query(
      'INSERT INTO customers (name, email, phone, address, cpf) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.name, data.email, data.phone, data.address, data.cpf],
    );
    return result.rows[0];
  }

  async update(
    id: number | string,
    data: Partial<Customer>,
    client?: PoolClient,
  ): Promise<Customer | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id, client);

    values.push(id);
    const query = `UPDATE customers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    const executor = client || this.db;
    const result = await executor.query(query, values);
    return result.rows[0];
  }

  async delete(id: number | string): Promise<boolean> {
    const result = await this.db.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  async search(filters: CustomerFilters): Promise<{ customers: Customer[]; total: number }> {
    const { searchTerm, limit = 10, offset = 0 } = filters;
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    let whereClause = 'WHERE 1=1';
    if (searchTerm) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      queryParams.push(`%${searchTerm}%`);
      paramIndex++;
    }

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM customers ${whereClause}`,
      queryParams,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    queryParams.push(limit, offset);
    const result = await this.db.query(
      `
      SELECT * FROM customers
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `,
      queryParams,
    );

    return { customers: result.rows, total };
  }

  async getSegments(): Promise<any[]> {
    const result = await this.db.query(`
      SELECT rfm_segment, COUNT(id) AS customer_count
      FROM customers
      WHERE rfm_segment IS NOT NULL
      GROUP BY rfm_segment
      ORDER BY customer_count DESC;
    `);
    return result.rows.map((row) => ({ ...row, customer_count: parseInt(row.customer_count, 10) }));
  }

  // Métodos de Store Credit e Loyalty (específicos)
  async updateStoreCredit(
    id: string | number,
    amountChange: number,
    client?: PoolClient,
  ): Promise<Customer> {
    const executor = client || this.db;
    const result = await executor.query(
      'UPDATE customers SET store_credit_balance = store_credit_balance + $1 WHERE id = $2 RETURNING *',
      [amountChange, id],
    );
    return result.rows[0];
  }

  async logStoreCreditTransaction(data: any, client?: PoolClient): Promise<void> {
    const executor = client || this.db;
    await executor.query(
      'INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5)',
      [data.customer_id, data.amount, data.type, data.reason, data.related_id],
    );
  }

  async updateLoyaltyPoints(
    id: string | number,
    pointsChange: number,
    client?: PoolClient,
  ): Promise<Customer> {
    const executor = client || this.db;
    const result = await executor.query(
      'UPDATE customers SET loyalty_points = GREATEST(0, loyalty_points + $1) WHERE id = $2 RETURNING *',
      [pointsChange, id],
    );
    return result.rows[0];
  }
}

export const customerRepository = new CustomerRepository();
