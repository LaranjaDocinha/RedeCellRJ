import { getPool } from '../db/index.js';
const pool = getPool();

export class Customer360Service {
  async getCustomer360View(customerId: string) {
    // Fetch customer basic info
    const customerQuery = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
    const customer = customerQuery.rows[0];

    if (!customer) {
      return null;
    }

    // Fetch sales history
    const salesQuery = await pool.query(
      'SELECT s.*, si.product_id, si.quantity, si.price_at_sale FROM sales s JOIN sale_items si ON s.id = si.sale_id WHERE s.customer_id = $1 ORDER BY s.sale_date DESC',
      [customerId],
    );
    const sales = salesQuery.rows;

    // Fetch service orders history
    const serviceOrdersQuery = await pool.query(
      'SELECT * FROM service_orders WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId],
    );
    const serviceOrders = serviceOrdersQuery.rows;

    // Fetch loyalty transactions
    const loyaltyTransactionsQuery = await pool.query(
      'SELECT * FROM loyalty_transactions WHERE customer_id = $1 ORDER BY transaction_date DESC',
      [customerId],
    );
    const loyaltyTransactions = loyaltyTransactionsQuery.rows;

    // Fetch communications history
    const communicationsQuery = await pool.query(
      'SELECT * FROM customer_communications WHERE customer_id = $1 ORDER BY communication_timestamp DESC',
      [customerId],
    );
    const communications = communicationsQuery.rows;

    return {
      customer,
      sales,
      serviceOrders,
      loyaltyTransactions,
      communications,
    };
  }
}
