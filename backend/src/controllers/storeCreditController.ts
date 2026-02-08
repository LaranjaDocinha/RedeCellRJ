import { Request, Response } from 'express';
import { getPool } from '../db/index.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

// Helper to format currency values
const formatCurrency = (value: any) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const executeTransaction = async (
  client: any,
  customerId: string,
  amount: number,
  type: 'credit' | 'debit',
  reason: string,
  relatedId?: string,
) => {
  const transactionResult = await client.query(
    'INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
    [customerId, amount, type, reason, relatedId],
  );

  const balanceChange = type === 'credit' ? amount : -amount;
  const customerUpdateResult = await client.query(
    'UPDATE customers SET store_credit_balance = store_credit_balance + $1 WHERE id = $2 RETURNING *;',
    [balanceChange, customerId],
  );

  return {
    transaction: transactionResult.rows[0],
    customer: customerUpdateResult.rows[0],
  };
};

export const addStoreCredit = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { amount, reason, relatedId } = req.body;

  if (!amount || !reason) {
    return sendError(res, 'Amount and reason are required.', 'VALIDATION_ERROR', 400);
  }

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const result = await executeTransaction(
      client,
      customerId,
      amount,
      'credit',
      reason,
      relatedId,
    );

    await client.query('COMMIT');

    sendSuccess(
      res,
      {
        message: 'Store credit added successfully',
        transaction: { ...result.transaction, amount: formatCurrency(result.transaction.amount) },
        customer: {
          ...result.customer,
          store_credit_balance: formatCurrency(result.customer.store_credit_balance),
        },
      },
      200,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding store credit:', error);
    sendError(res, 'Internal server error.', 'INTERNAL_ERROR', 500);
  } finally {
    client.release();
  }
};

export const debitStoreCredit = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { amount, reason, relatedId } = req.body;

  if (!amount || !reason) {
    return sendError(res, 'Amount and reason are required.', 'VALIDATION_ERROR', 400);
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
      return sendError(res, 'Customer not found.', 'NOT_FOUND', 404);
    }

    const currentBalance = parseFloat(customerResult.rows[0].store_credit_balance);
    if (currentBalance < amount) {
      await client.query('ROLLBACK');
      return sendError(res, 'Insufficient store credit balance.', 'INSUFFICIENT_FUNDS', 400);
    }

    const result = await executeTransaction(client, customerId, amount, 'debit', reason, relatedId);

    await client.query('COMMIT');

    sendSuccess(
      res,
      {
        message: 'Store credit debited successfully',
        transaction: { ...result.transaction, amount: formatCurrency(result.transaction.amount) },
        customer: {
          ...result.customer,
          store_credit_balance: formatCurrency(result.customer.store_credit_balance),
        },
      },
      200,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error debiting store credit:', error);
    sendError(res, 'Internal server error.', 'INTERNAL_ERROR', 500);
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
      return sendError(res, 'Customer not found.', 'NOT_FOUND', 404);
    }

    const formattedHistory = historyResult.rows.map((t: any) => ({
      ...t,
      amount: formatCurrency(t.amount),
    }));

    sendSuccess(res, {
      balance: formatCurrency(balanceResult.rows[0].store_credit_balance),
      history: formattedHistory,
    });
  } catch (error) {
    console.error('Error fetching store credit history:', error);
    sendError(res, 'Internal server error.', 'INTERNAL_ERROR', 500);
  } finally {
    client.release();
  }
};
