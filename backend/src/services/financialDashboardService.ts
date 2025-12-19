import { getPool } from '../db/index.js';

export const getFinancialDashboardData = async () => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Fetching total revenue, total COGS, and total profit
    const financialSummary = await client.query(
      `SELECT
        SUM(total_amount) as total_revenue,
        (SELECT SUM(si.quantity * si.cost_price) FROM sale_items si) as total_cogs
       FROM sales`,
    );

    const { total_revenue, total_cogs } = financialSummary.rows[0];
    const total_profit = (total_revenue || 0) - (total_cogs || 0);

    // Fetching sales by category
    const salesByCategory = await client.query(
      `SELECT
        c.name as category_name,
        SUM(si.total_price) as total_sales
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       GROUP BY c.name
       ORDER BY total_sales DESC`,
    );

    // Fetching top selling products
    const topSellingProducts = await client.query(
      `SELECT
        p.name as product_name,
        SUM(si.quantity) as total_quantity_sold
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       GROUP BY p.name
       ORDER BY total_quantity_sold DESC
       LIMIT 10`,
    );

    return {
      total_revenue: parseFloat(total_revenue) || 0,
      total_cogs: parseFloat(total_cogs) || 0,
      total_profit: total_profit || 0,
      sales_by_category: salesByCategory.rows,
      top_selling_products: topSellingProducts.rows,
    };
  } finally {
    client.release();
  }
};
