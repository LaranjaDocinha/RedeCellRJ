import { getPool } from '../db/index.js';
class ZReportService {
    /**
     * Generates a Z-Report (Cash Closing Report) for a specified date range.
     */
    async generateZReport(startDate, endDate) {
        const pool = getPool();
        // Total Sales Amount and Total Transactions
        const salesSummaryRes = await pool.query(`SELECT
        COALESCE(SUM(s.total_amount), 0) AS total_sales_amount,
        COUNT(s.id) AS total_transactions
      FROM sales s
      WHERE s.sale_date BETWEEN $1 AND $2`, [startDate, endDate]);
        const { total_sales_amount, total_transactions } = salesSummaryRes.rows[0];
        // Total Discounts (assuming discounts are applied per sale or per item and reduce total_amount)
        // For simplicity, we'll assume total_amount already reflects discounts.
        // If discounts were separate, we'd query a 'discounts' table.
        const totalDiscounts = 0; // Placeholder
        // Total Returns (assuming returns reduce total sales or are recorded separately)
        // For simplicity, we'll assume returns are handled by a separate process not reflected here.
        // If returns were separate, we'd query a 'returns' table.
        const totalReturns = 0; // Placeholder
        // Cash In/Out (Sangria/Suprimento) - Placeholder for now, as these tables don't exist yet
        const cashIn = 0; // Suprimento
        const cashOut = 0; // Sangria
        // Sales by Payment Method
        const salesByPaymentMethodRes = await pool.query(`SELECT
        sp.payment_method AS method,
        COALESCE(SUM(sp.amount), 0) AS amount
      FROM sales s
      JOIN sale_payments sp ON s.id = sp.sale_id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY sp.payment_method
      ORDER BY amount DESC`, [startDate, endDate]);
        const salesByPaymentMethod = salesByPaymentMethodRes.rows.map((row) => ({
            method: row.method,
            amount: parseFloat(row.amount),
        }));
        // Sales by Category
        const salesByCategoryRes = await pool.query(`SELECT
        c.name AS category,
        COALESCE(SUM(si.total_price), 0) AS amount
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY c.name
      ORDER BY amount DESC`, [startDate, endDate]);
        const salesByCategory = salesByCategoryRes.rows.map((row) => ({
            category: row.category,
            amount: parseFloat(row.amount),
        }));
        // Calculate Net Cash (simplified)
        let netCash = parseFloat(total_sales_amount);
        salesByPaymentMethod.forEach((payment) => {
            if (payment.method === 'cash') {
                netCash += payment.amount; // Add cash received
            }
        });
        netCash += cashIn;
        netCash -= cashOut;
        return {
            startDate,
            endDate,
            totalSalesAmount: parseFloat(total_sales_amount),
            totalTransactions: parseInt(total_transactions),
            totalDiscounts,
            totalReturns,
            cashIn,
            cashOut,
            netCash,
            salesByPaymentMethod,
            salesByCategory,
        };
    }
}
export const zReportService = new ZReportService();
