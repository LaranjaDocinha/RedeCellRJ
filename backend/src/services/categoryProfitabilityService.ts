import { getPool } from '../db/index.js';

export const getCategoryProfitability = async (
  branchId: number | undefined,
  startDate: string,
  endDate: string,
) => {
  const client = await getPool().connect();
  try {
    let query = `
      SELECT
        c.id as category_id,
        c.name as category_name,
        SUM(si.total_price) as total_revenue,
        SUM(si.cost_price * si.quantity) as total_cost,
        SUM(si.total_price - (si.cost_price * si.quantity)) as total_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;

    if (branchId) {
      query += ` AND s.branch_id = $${paramIndex++}`;
      params.push(branchId.toString());
    }

    query += ` GROUP BY c.id, c.name ORDER BY total_profit DESC`;

    const result = await client.query(query, params);

    return result.rows.map((row) => ({
      category_id: row.category_id,
      category_name: row.category_name,
      total_revenue: parseFloat(row.total_revenue || 0).toFixed(2),
      total_cost: parseFloat(row.total_cost || 0).toFixed(2),
      total_profit: parseFloat(row.total_profit || 0).toFixed(2),
      profit_margin: (
        (parseFloat(row.total_profit || 0) / parseFloat(row.total_revenue || 1)) *
        100
      ).toFixed(2),
    }));
  } finally {
    client.release();
  }
};
