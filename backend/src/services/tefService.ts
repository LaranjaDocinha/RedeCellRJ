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
  constructor() {
    // Constructor
  }

  /**
   * Processes an incoming TEF transaction from a local TEF client application.
   * This method would typically record the transaction and update the associated sale.
   */
  async processTefTransaction(data: TefTransactionData): Promise<TefTransactionData> {
    const { transactionId, amount, paymentMethod, status } = data;

    console.log(`Processing TEF Transaction: ${transactionId}`);
    console.log(`Amount: ${amount}, Method: ${paymentMethod}, Status: ${status}`);

    if (status === 'denied') {
      throw new AppError('TEF Transaction denied', 400);
    }

    return { ...data, status: 'approved' }; // Simulate approval
  }

  /**
   * Retrieves the status of a TEF transaction.
   * In a real scenario, this would query the database for the stored transaction status.
   */
  async getTefTransactionStatus(
    _transactionId: string,
  ): Promise<'approved' | 'denied' | 'pending'> {
    // Simulate fetching status from a database
    // For demonstration, let's randomly return approved or pending
    const statuses = ['pending', 'approved'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return randomStatus as 'approved' | 'denied' | 'pending';
  }
}

export const tefService = new TefService();
