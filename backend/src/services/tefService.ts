import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface TefTransactionData {
  transactionId: string;
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card';
  cardBrand?: string;
  nsu?: string; // Número Sequencial Único
  authorizationCode?: string;
  installments?: number;
  status: 'approved' | 'denied' | 'pending';
  saleId?: string; // Optional: Link to an existing sale if payment is processed separately
}

class TefService {
  /**
   * Processes an incoming TEF transaction from a local TEF client application.
   * This method would typically record the transaction and update the associated sale.
   */
  async processTefTransaction(data: TefTransactionData): Promise<TefTransactionData> {
    const {
      transactionId,
      amount,
      paymentMethod,
      cardBrand,
      nsu,
      authorizationCode,
      installments,
      status,
      saleId,
    } = data;
    const pool = getPool();

    // In a real scenario, you'd perform more robust validation and potentially
    // update a sale record or create a new payment record linked to a sale.
    // For this simulation, we'll just log and return.

    console.log(`Processing TEF Transaction: ${transactionId}`);
    console.log(`Amount: ${amount}, Method: ${paymentMethod}, Status: ${status}`);

    // Example: Store the TEF transaction details in a dedicated table
    // For now, we'll just simulate success.
    // If saleId is provided, you might update the sale's payment status or add this as a payment.

    // Simulate storing transaction
    // await pool.query(
    //   `INSERT INTO tef_transactions (transaction_id, amount, payment_method, card_brand, nsu, authorization_code, installments, status, sale_id)
    //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    //   [transactionId, amount, paymentMethod, cardBrand, nsu, authorizationCode, installments, status, saleId]
    // );

    if (status === 'denied') {
      throw new AppError('TEF Transaction denied', 400);
    }

    return { ...data, status: 'approved' }; // Simulate approval
  }

  /**
   * Retrieves the status of a TEF transaction.
   * In a real scenario, this would query the database for the stored transaction status.
   */
  async getTefTransactionStatus(transactionId: string): Promise<'approved' | 'denied' | 'pending'> {
    // Simulate fetching status from a database
    // For demonstration, let's randomly return approved or pending
    const statuses = ['pending', 'approved'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return randomStatus as 'approved' | 'denied' | 'pending';
  }
}

export const tefService = new TefService();
