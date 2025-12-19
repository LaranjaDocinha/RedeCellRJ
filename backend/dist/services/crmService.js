import pool from '../db/index.js';
// This is a heavy query. In a real-world scenario, this should be run on a replica database or during off-peak hours.
export const calculateRfmScores = async () => {
    const query = `
    WITH customer_kpis AS (
      SELECT
        customer_id,
        MAX(sale_date) as last_purchase_date,
        COUNT(id) as frequency,
        SUM(total_amount) as monetary
      FROM sales
      GROUP BY customer_id
    ),
    rfm_scores AS (
      SELECT
        customer_id,
        NTILE(5) OVER (ORDER BY last_purchase_date DESC) as r_score, -- Recency
        NTILE(5) OVER (ORDER BY frequency ASC) as f_score,      -- Frequency
        NTILE(5) OVER (ORDER BY monetary ASC) as m_score       -- Monetary
      FROM customer_kpis
    )
    SELECT c.name, c.email, r.r_score, r.f_score, r.m_score FROM rfm_scores r
    JOIN customers c ON r.customer_id = c.id
    ORDER BY (r.r_score + r.f_score + r.m_score) DESC;
  `;
    const result = await pool.query(query);
    return result.rows;
};
