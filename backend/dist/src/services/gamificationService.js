import pool from '../db/index.js';
export const getLeaderboard = async (metric, period = 'monthly') => {
    let dateFilter = '';
    switch (period) {
        case 'daily':
            dateFilter = `AND s.sale_date >= CURRENT_DATE - INTERVAL '1 day'`;
            break;
        case 'weekly':
            dateFilter = `AND s.sale_date >= CURRENT_DATE - INTERVAL '7 days'`;
            break;
        case 'monthly':
            dateFilter = `AND s.sale_date >= CURRENT_DATE - INTERVAL '30 days'`;
            break;
        case 'all_time':
        default:
            dateFilter = ''; // Sem filtro de data
            break;
    }
    let query;
    if (metric === 'sales_volume') {
        query = `
      SELECT
        u.id,
        u.name,
        u.email, -- Added email for gravatar if needed
        COALESCE(SUM(s.total_amount), 0) as total,
        FLOOR(COALESCE(SUM(s.total_amount), 0) * 0.1) as xp,
        FLOOR(SQRT(COALESCE(SUM(s.total_amount), 0) * 0.1) / 10) + 1 as level
      FROM sales s
      JOIN users u ON s.user_id = u.id
      ${dateFilter}
      GROUP BY u.id, u.name, u.email
      ORDER BY xp DESC
      LIMIT 10;
    `;
    }
    else {
        // repairs_completed
        // Ajustar o dateFilter para service_orders
        let serviceOrderDateFilter = '';
        switch (period) {
            case 'daily':
                serviceOrderDateFilter = `AND so.updated_at >= CURRENT_DATE - INTERVAL '1 day'`;
                break;
            case 'weekly':
                serviceOrderDateFilter = `AND so.updated_at >= CURRENT_DATE - INTERVAL '7 days'`;
                break;
            case 'monthly':
                serviceOrderDateFilter = `AND so.updated_at >= CURRENT_DATE - INTERVAL '30 days'`;
                break;
            case 'all_time':
            default:
                serviceOrderDateFilter = '';
                break;
        }
        query = `
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(so.id) as total,
        (COUNT(so.id) * 50) as xp,
        FLOOR(SQRT(COUNT(so.id) * 50) / 10) + 1 as level
      FROM service_orders so
      JOIN users u ON so.technician_id = u.id
      WHERE so.status = 'Entregue' ${serviceOrderDateFilter}
      GROUP BY u.id, u.name, u.email
      ORDER BY xp DESC
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
// Refinado para ser mais explícito sobre métricas e recompensas
export const createChallenge = async (title, description, metric, // Ex: 'sales_volume', 'repairs_completed', 'customer_satisfaction'
targetValue, rewardXp, startDate, // YYYY-MM-DD
endDate) => {
    const result = await pool.query('INSERT INTO gamification_challenges (title, description, metric, target_value, reward_xp, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, metric, targetValue, rewardXp, startDate, endDate]);
    return result.rows[0];
};
export const getMyChallenges = async (userId) => {
    // Returns challenges that are active, with user progress
    const result = await pool.query(`SELECT
       c.*,
       COALESCE(ucp.current_value, 0) as current_value,
       COALESCE(ucp.completed, false) as completed
     FROM gamification_challenges c
     LEFT JOIN user_challenge_progress ucp ON c.id = ucp.challenge_id AND ucp.user_id = $1
     WHERE c.end_date >= NOW() AND c.start_date <= NOW()`, [userId]);
    return result.rows;
};
export const updateChallengeProgress = async (userId, metric, value) => {
    // Find active challenges for this metric
    const challengesRes = await pool.query(`SELECT id, target_value, reward_xp FROM gamification_challenges
     WHERE metric = $1 AND start_date <= NOW() AND end_date >= NOW()`, [metric]);
    for (const challenge of challengesRes.rows) {
        // Insert or update progress
        // Increment value
        await pool.query(`INSERT INTO user_challenge_progress (user_id, challenge_id, current_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, challenge_id)
       DO UPDATE SET current_value = user_challenge_progress.current_value + $3`, [userId, challenge.id, value]);
        // Check completion
        const progressRes = await pool.query('SELECT current_value, completed FROM user_challenge_progress WHERE user_id = $1 AND challenge_id = $2', [userId, challenge.id]);
        const progress = progressRes.rows[0];
        if (!progress.completed && parseFloat(progress.current_value) >= parseFloat(challenge.target_value)) {
            await pool.query('UPDATE user_challenge_progress SET completed = TRUE, completed_at = NOW() WHERE user_id = $1 AND challenge_id = $2', [userId, challenge.id]);
            // TODO: Award XP to user (Users table update)
            console.log(`User ${userId} completed challenge ${challenge.id}!`);
        }
    }
};
