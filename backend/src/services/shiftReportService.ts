import { getPool } from '../db/index.js';

interface ShiftReportData {
  totalSalesAmount: number;
  totalTransactions: number;
  salesByPaymentMethod: Array<{ method: string; amount: number }>;
  salesByCategory: Array<{ category: string; amount: number }>;
  averageTransactionValue: number;
}

class ShiftReportService {
  /**
   * Retrieves aggregated sales data for the current shift.
   * For simplicity, "current shift" is defined as sales within the last 24 hours.
   * This can be extended to use actual shift start/end times from a time clock system.
   */
  async getCurrentShiftReport(branchId: number): Promise<ShiftReportData> {
    const pool = getPool();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Total Sales Amount and Total Transactions
    const salesSummaryRes = await pool.query(
      `SELECT
        COALESCE(SUM(s.total_amount), 0) AS total_sales_amount,
        COUNT(s.id) AS total_transactions
      FROM sales s
      WHERE s.sale_date >= $1 AND s.branch_id = $2`,
      [twentyFourHoursAgo, branchId],
    );
    const { total_sales_amount, total_transactions } = salesSummaryRes.rows[0];

    // Sales by Payment Method
    const salesByPaymentMethodRes = await pool.query(
      `SELECT
        sp.payment_method AS method,
        COALESCE(SUM(sp.amount), 0) AS amount
      FROM sales s
      JOIN sale_payments sp ON s.id = sp.sale_id
      WHERE s.sale_date >= $1 AND s.branch_id = $2
      GROUP BY sp.payment_method
      ORDER BY amount DESC`,
      [twentyFourHoursAgo, branchId],
    );
    const salesByPaymentMethod = salesByPaymentMethodRes.rows.map((row) => ({
      method: row.method,
      amount: parseFloat(row.amount),
    }));

    // Sales by Category
    const salesByCategoryRes = await pool.query(
      `SELECT
        c.name AS category,
        COALESCE(SUM(si.total_price), 0) AS amount
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.sale_date >= $1 AND s.branch_id = $2
      GROUP BY c.name
      ORDER BY amount DESC`,
      [twentyFourHoursAgo, branchId],
    );
    const salesByCategory = salesByCategoryRes.rows.map((row) => ({
      category: row.category,
      amount: parseFloat(row.amount),
    }));

    const averageTransactionValue =
      total_transactions > 0 ? parseFloat(total_sales_amount) / parseInt(total_transactions) : 0;

    return {
      totalSalesAmount: parseFloat(total_sales_amount),
      totalTransactions: parseInt(total_transactions),
      salesByPaymentMethod,
      salesByCategory,
      averageTransactionValue,
    };
  }
}

export const shiftReportService = new ShiftReportService();
