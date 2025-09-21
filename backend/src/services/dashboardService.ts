import pool from '../db/index.js';

export const dashboardService = {
  async getTotalSalesAmount() {
    const { rows } = await pool.query('SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales;');
    return parseFloat(rows[0].total_sales);
  },

  async getSalesByMonth() {
    const { rows } = await pool.query(
      `SELECT
        TO_CHAR(sale_date, 'YYYY-MM') AS month,
        COALESCE(SUM(total_amount), 0) AS monthly_sales
      FROM sales
      GROUP BY month
      ORDER BY month ASC;`
    );
    return rows.map(row => ({ month: row.month, monthly_sales: parseFloat(row.monthly_sales) }));
  },

  async getTopSellingProducts(limit: number = 5) {
    const { rows } = await pool.query(
      `SELECT
        p.name AS product_name,
        pv.color AS variation_color,
        SUM(si.quantity) AS total_quantity_sold
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      GROUP BY p.name, pv.color
      ORDER BY total_quantity_sold DESC
      LIMIT $1;`,
      [limit]
    );
    return rows.map(row => ({ ...row, total_quantity_sold: parseInt(row.total_quantity_sold) }));
  },
};
