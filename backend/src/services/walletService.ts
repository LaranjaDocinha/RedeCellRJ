import pool from '../db/index.js';

export const walletService = {
  async addCredit(
    customerId: number,
    amount: number,
    type: string,
    saleId?: number,
    notes?: string,
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Garantir que a carteira existe (Upsert)
      await client.query(
        `INSERT INTO customer_wallets (customer_id, balance) 
         VALUES ($1, $2) 
         ON CONFLICT (customer_id) DO UPDATE SET balance = customer_wallets.balance + $2, updated_at = NOW()`,
        [customerId, amount],
      );

      // Registrar transação
      await client.query(
        `INSERT INTO wallet_transactions (customer_id, amount, type, sale_id, notes) 
         VALUES ($1, $2, $3, $4, $5)`,
        [customerId, amount, type, saleId, notes],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async debit(customerId: number, amount: number, saleId: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const walletRes = await client.query(
        'SELECT balance FROM customer_wallets WHERE customer_id = $1 FOR UPDATE',
        [customerId],
      );
      const currentBalance = Number(walletRes.rows[0]?.balance || 0);

      if (currentBalance < amount) {
        throw new Error('Saldo insuficiente na carteira.');
      }

      await client.query(
        'UPDATE customer_wallets SET balance = balance - $1, updated_at = NOW() WHERE customer_id = $2',
        [amount, customerId],
      );

      await client.query(
        `INSERT INTO wallet_transactions (customer_id, amount, type, sale_id, notes) 
         VALUES ($1, $2, 'payment', $3, 'Pagamento de venda')`,
        [customerId, -amount, saleId],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getBalance(customerId: number) {
    const res = await pool.query('SELECT balance FROM customer_wallets WHERE customer_id = $1', [
      customerId,
    ]);
    return Number(res.rows[0]?.balance || 0);
  },
};
