import pool from '../db/index.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

// This would be replaced by actual ERP API calls or file transfer
const ERP_EXPORT_DIR = process.env.ERP_EXPORT_DIR || path.resolve('temp/erp_exports');

export const erpService = {
  async exportSalesToERP(startDate: Date, endDate: Date): Promise<string> {
    logger.info(
      `Exporting sales data for ERP from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Fetch sales data within the date range
    const salesRes = await pool.query(
      `SELECT
         s.id AS sale_id,
         s.total_amount,
         s.sale_date,
         c.name AS customer_name,
         c.email AS customer_email,
         u.name AS salesperson_name,
         si.product_id,
         si.variation_id,
         p.name AS product_name,
         pv.color AS product_color,
         pv.storage_capacity AS product_capacity,
         si.quantity,
         si.unit_price,
         si.cost_price,
         sp.payment_method,
         sp.amount AS payment_amount
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN users u ON s.user_id = u.id
       JOIN sale_items si ON s.id = si.sale_id
       JOIN product_variations pv ON si.variation_id = pv.id
       JOIN products p ON pv.product_id = p.id
       JOIN sale_payments sp ON s.id = sp.sale_id
       WHERE s.sale_date >= $1 AND s.sale_date <= $2
       ORDER BY s.sale_date ASC`,
      [startDate, endDate],
    );

    const salesData = salesRes.rows;
    if (salesData.length === 0) {
      logger.info('No sales data to export for ERP.');
      return 'No data exported.';
    }

    // Transform data into a flat structure suitable for CSV or JSON
    const transformedData = salesData.map((sale) => ({
      sale_id: sale.sale_id,
      sale_date: sale.sale_date,
      total_amount: sale.total_amount,
      customer_name: sale.customer_name,
      customer_email: sale.customer_email,
      salesperson_name: sale.salesperson_name,
      product_id: sale.product_id,
      product_name: sale.product_name,
      product_variation_id: sale.variation_id,
      product_variation_details: `${sale.product_color}${sale.product_capacity ? ' - ' + sale.product_capacity : ''}`,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      cost_price: sale.cost_price,
      payment_method: sale.payment_method,
      payment_amount: sale.payment_amount,
    }));

    // Example: Export to JSON file
    const fileName = `sales_erp_export_${new Date().toISOString().slice(0, 10)}.json`;
    const filePath = path.join(ERP_EXPORT_DIR, fileName);

    await fs.mkdir(ERP_EXPORT_DIR, { recursive: true }); // Ensure directory exists
    await fs.writeFile(filePath, JSON.stringify(transformedData, null, 2));

    logger.info(`Sales data exported to ${filePath}`);
    return filePath;
  },

  async exportExpensesToERP(startDate: Date, endDate: Date): Promise<string> {
    logger.info(
      `Exporting expense data for ERP from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Fetch expense data (assuming an 'expenses' table exists)
    const expensesRes = await pool.query(
      `SELECT
         id AS expense_id,
         amount,
         description,
         expense_date,
         category,
         payment_method
       FROM expenses
       WHERE expense_date >= $1 AND expense_date <= $2
       ORDER BY expense_date ASC`,
      [startDate, endDate],
    );

    const expensesData = expensesRes.rows;
    if (expensesData.length === 0) {
      logger.info('No expense data to export for ERP.');
      return 'No data exported.';
    }

    const fileName = `expenses_erp_export_${new Date().toISOString().slice(0, 10)}.json`;
    const filePath = path.join(ERP_EXPORT_DIR, fileName);

    await fs.mkdir(ERP_EXPORT_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(expensesData, null, 2));

    logger.info(`Expenses data exported to ${filePath}`);
    return filePath;
  },
};
