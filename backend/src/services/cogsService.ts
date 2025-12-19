import { getPool } from '../db/index.js';

export const generateCogsReport = async (startDate: string, endDate: string) => {
  console.log('[cogsService] startDate:', startDate, 'endDate:', endDate);
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        COALESCE(SUM(si.quantity * si.cost_price), 0) as total_cogs
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE s.sale_date >= $1::timestamp AND s.sale_date < ($2::timestamp + INTERVAL '1 day')`,
      [startDate, endDate],
    );

    return result.rows[0];
  } finally {
    client.release();
  }
};
