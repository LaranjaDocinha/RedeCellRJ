import pool from '../db/index.js';

export const reportService = {
  async getSalesByDate(startDate?: string, endDate?: string) {
    let query = `
      SELECT
        DATE(sale_date) as sale_date,
        SUM(total_amount) as daily_sales
      FROM sales
    `;
    const params = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      query += ` WHERE sale_date >= $${paramIndex++} AND sale_date <= $${paramIndex++}`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` WHERE sale_date >= $${paramIndex++}`;
      params.push(startDate);
    } else if (endDate) {
      query += ` WHERE sale_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ` GROUP BY DATE(sale_date) ORDER BY sale_date ASC`;

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async getSalesByProduct(startDate?: string, endDate?: string, productId?: number) {
    let query = `
      SELECT
        p.name as product_name,
        pv.color,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.price_at_sale * si.quantity) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN sales s ON si.sale_id = s.id
    `;
    const params = [];
    let paramIndex = 1;
    const conditions = [];

    if (startDate) {
      conditions.push(`s.sale_date >= $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`s.sale_date <= $${paramIndex++}`);
      params.push(endDate);
    }
    if (productId) {
      conditions.push(`si.product_id = $${paramIndex++}`);
      params.push(productId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(` AND `);
    }

    query += ` GROUP BY p.name, pv.color ORDER BY total_revenue DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async getSalesByCustomer(startDate?: string, endDate?: string, customerId?: number) {
    let query = `
      SELECT
        u.name as customer_name,
        u.email as customer_email,
        SUM(s.total_amount) as total_spent,
        COUNT(s.id) as total_sales_count
      FROM sales s
      JOIN users u ON s.user_id = u.id
    `;
    const params = [];
    let paramIndex = 1;
    const conditions = [];

    if (startDate) {
      conditions.push(`s.sale_date >= $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`s.sale_date <= $${paramIndex++}`);
      params.push(endDate);
    }
    if (customerId) {
      conditions.push(`s.user_id = $${paramIndex++}`);
      params.push(customerId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(` AND `);
    }

    query += ` GROUP BY u.name, u.email ORDER BY total_spent DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
  },
};
