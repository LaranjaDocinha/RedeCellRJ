import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

class StoreCreditService {
  async addCredit(customerId: number, amount: number, reason: string, relatedId?: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE customers SET store_credit_balance = store_credit_balance + $1 WHERE id = $2',
        [amount, customerId],
      );

      await client.query(
        'INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5)',
        [customerId, amount, 'credit', reason, relatedId],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async useCredit(customerId: number, amount: number, reason: string, relatedId?: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const customerResult = await client.query(
        'SELECT store_credit_balance FROM customers WHERE id = $1 FOR UPDATE',
        [customerId],
      );
      const balance = parseFloat(customerResult.rows[0].store_credit_balance);

      if (balance < amount) {
        throw new AppError('Insufficient store credit balance', 400);
      }

      await client.query(
        'UPDATE customers SET store_credit_balance = store_credit_balance - $1 WHERE id = $2',
        [amount, customerId],
      );

      await client.query(
        'INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5)',
        [customerId, -amount, 'debit', reason, relatedId],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCustomerBalance(customerId: number) {
    const result = await pool.query('SELECT store_credit_balance FROM customers WHERE id = $1', [
      customerId,
    ]);
    return result.rows[0]?.store_credit_balance || 0;
  }

  async getCustomerTransactionHistory(customerId: number) {
    const result = await pool.query(
      'SELECT * FROM store_credit_transactions WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId],
    );
    return result.rows;
  }
}

export const storeCreditService = new StoreCreditService();
