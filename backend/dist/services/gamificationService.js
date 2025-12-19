import pool from '../db/index.js';
export const getLeaderboard = async (metric) => {
    let query;
    if (metric === 'sales_volume') {
        query = `
      SELECT u.id, u.name, SUM(s.total_amount) as total
      FROM sales s
      JOIN users u ON s.user_id = u.id
      WHERE s.sale_date > NOW() - INTERVAL '30 days'
      GROUP BY u.id
      ORDER BY total DESC
      LIMIT 10;
    `;
    }
    else {
        // repairs_completed
        query = `
      SELECT u.id, u.name, COUNT(so.id) as total
      FROM service_orders so
      JOIN users u ON so.technician_id = u.id
      WHERE so.status = 'Entregue' AND so.updated_at > NOW() - INTERVAL '30 days'
      GROUP BY u.id
      ORDER BY total DESC
      LIMIT 10;
    `;
    }
    const result = await pool.query(query);
    return result.rows;
};
export const awardBadge = async (userId, badgeId) => {
    try {
        await pool.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT (user_id, badge_id) DO NOTHING', [userId, badgeId]);
    }
    catch (error) {
        console.error(`Failed to award badge ${badgeId} to user ${userId}`, error);
        // Depending on requirements, you might want to throw the error
    }
};
export const getUserBadges = async (userId) => {
    const result = await pool.query('SELECT b.* FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = $1', [userId]);
    return result.rows;
};
