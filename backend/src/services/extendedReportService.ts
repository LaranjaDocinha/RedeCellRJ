import pool from '../db/index.js';

export const getRepairProfitability = async () => {
  // This is a complex query and should be refined
  const query = `
    SELECT 
      so.id, 
      so.budget_value,
      SUM(COALESCE(p.cost_price, 0) * soi.quantity) as total_cost
    FROM service_orders so
    LEFT JOIN service_order_items soi ON so.id = soi.service_order_id
    LEFT JOIN parts p ON soi.part_id = p.id
    WHERE so.status = 'Entregue'
    GROUP BY so.id
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getTradeInMargin = async () => {
  // Placeholder for another complex query
  return [];
};
