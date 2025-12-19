import { Request, Response } from 'express';
import { getPool } from '../db/index.js';

// Helper to format currency values
const formatCurrency = (value: any) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const addStoreCredit = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { amount, reason, relatedId } = req.body;

  if (!amount || !reason) {
    return res.status(400).json({ message: 'Amount and reason are required.' });
  }

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const transactionResult = await client.query(
      'INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [customerId, amount, 'credit', reason, relatedId],
    );

    const customerUpdateResult = await client.query(
      'UPDATE customers SET store_credit_balance = store_credit_balance + $1 WHERE id = $2 RETURNING *;',
      [amount, customerId],
    );

    await client.query('COMMIT');

    const formattedTransaction = {
      ...transactionResult.rows[0],
      amount: formatCurrency(transactionResult.rows[0].amount),
    };

    const formattedCustomer = {
      ...customerUpdateResult.rows[0],
      store_credit_balance: formatCurrency(customerUpdateResult.rows[0].store_credit_balance),
    };

    res.status(201).json({ transaction: formattedTransaction, customer: formattedCustomer });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding store credit:', error);
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

export const debitStoreCredit = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { amount, reason, relatedId } = req.body;

  if (!amount || !reason) {
    return res.status(400).json({ message: 'Amount and reason are required.' });
  }

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const customerResult = await client.query(
      'SELECT store_credit_balance FROM customers WHERE id = $1 FOR UPDATE;',
      [customerId],
    );

    if (customerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const currentBalance = parseFloat(customerResult.rows[0].store_credit_balance);
    if (currentBalance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient store credit balance.' });
    }

    const transactionResult = await client.query(
      'INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [customerId, amount, 'debit', reason, relatedId],
    );

    const customerUpdateResult = await client.query(
      'UPDATE customers SET store_credit_balance = store_credit_balance - $1 WHERE id = $2 RETURNING *;',
      [amount, customerId],
    );

    await client.query('COMMIT');

    const formattedTransaction = {
      ...transactionResult.rows[0],
      amount: formatCurrency(transactionResult.rows[0].amount),
    };

    const formattedCustomer = {
      ...customerUpdateResult.rows[0],
      store_credit_balance: formatCurrency(customerUpdateResult.rows[0].store_credit_balance),
    };

    res.status(201).json({ transaction: formattedTransaction, customer: formattedCustomer });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error debiting store credit:', error);
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

export const getStoreCreditHistory = async (req: Request, res: Response) => {
  const { customerId } = req.params;

  const client = await getPool().connect();
  try {
    const historyResult = await client.query(
      'SELECT *, amount::numeric FROM store_credit_transactions WHERE customer_id = $1 ORDER BY created_at DESC;',
      [customerId],
    );

    const balanceResult = await client.query(
      'SELECT store_credit_balance FROM customers WHERE id = $1;',
      [customerId],
    );

    if (balanceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const formattedHistory = historyResult.rows.map((t: any) => ({
      ...t,
      amount: formatCurrency(t.amount),
    }));

    res.status(200).json({
      balance: formatCurrency(balanceResult.rows[0].store_credit_balance),
      history: formattedHistory,
    });
  } catch (error) {
    console.error('Error fetching store credit history:', error);
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    client.release();
  }
};
