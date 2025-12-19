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
