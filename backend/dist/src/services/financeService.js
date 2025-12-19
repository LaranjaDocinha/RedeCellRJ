import pool from '../db/index.js';
// NOTE: This is a highly simplified P&L report. A real one would be much more complex,
// involving COGS, operational expenses, etc.
export const getSimplePLReport = async (startDate, endDate) => {
    const revenueRes = await pool.query('SELECT SUM(total_amount) as total_revenue FROM sales WHERE sale_date BETWEEN $1 AND $2', [startDate, endDate]);
    const partsCostRes = await pool.query(`
    SELECT SUM(p.cost_price * soi.quantity) as total_cost
    FROM service_order_items soi
    JOIN parts p ON soi.part_id = p.id
    JOIN service_orders so ON soi.service_order_id = so.id
    WHERE so.updated_at BETWEEN $1 AND $2 AND so.status = 'Entregue'
  `, [startDate, endDate]);
    const revenue = parseFloat(revenueRes.rows[0].total_revenue || 0);
    const cost = parseFloat(partsCostRes.rows[0].total_cost || 0);
    const profit = revenue - cost;
    return { revenue, cost, profit };
};
export const getCashFlowReport = async (startDate, endDate) => {
    const query = `
    SELECT 
      DATE(transaction_date) as date,
      SUM(CASE WHEN entry_type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM general_ledger
    WHERE transaction_date BETWEEN $1 AND $2
    GROUP BY DATE(transaction_date)
    ORDER BY date ASC;
  `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
};
export const getProductProfitabilityReport = async (startDate, endDate) => {
    const result = await pool.query(`SELECT 
      p.name AS product_name,
      pv.color AS variation_color,
      pv.storage_capacity,
      SUM(si.quantity) AS total_quantity_sold,
      SUM(si.unit_price * si.quantity) AS total_revenue,
      SUM(si.cost_price * si.quantity) AS total_cost_of_goods_sold,
      SUM((si.unit_price - si.cost_price) * si.quantity) AS gross_profit,
      (SUM((si.unit_price - si.cost_price) * si.quantity) / NULLIF(SUM(si.unit_price * si.quantity), 0)) * 100 AS gross_margin_percentage
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN product_variations pv ON si.variation_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE s.sale_date BETWEEN $1 AND $2
    GROUP BY p.name, pv.color, pv.storage_capacity
    ORDER BY gross_profit DESC;`, [startDate, endDate]);
    return result.rows.map(row => ({
        ...row,
        total_quantity_sold: parseInt(row.total_quantity_sold),
        total_revenue: parseFloat(row.total_revenue),
        total_cost_of_goods_sold: parseFloat(row.total_cost_of_goods_sold),
        gross_profit: parseFloat(row.gross_profit),
        gross_margin_percentage: parseFloat(row.gross_margin_percentage || 0)
    }));
};
