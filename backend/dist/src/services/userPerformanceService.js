import { getPool } from '../db/index.js';
export const getPerformanceData = async (userId, startDate, endDate) => {
    const client = await getPool().connect();
    try {
        // Aggregate sales data
        const salesRes = await client.query('SELECT SUM(total_amount) as total_sales, COUNT(*) as num_sales FROM sales WHERE user_id = $1 AND sale_date BETWEEN $2 AND $3', [userId, startDate, endDate]);
        // Aggregate repair data
        const repairsRes = await client.query("SELECT COUNT(*) as num_repairs FROM service_orders WHERE user_id = $1 AND status = 'Finalizado' AND updated_at BETWEEN $2 AND $3", [userId, startDate, endDate]);
        // Get sales goals progress
        const goalsRes = await client.query('SELECT sg.name, sg.target_value, usg.current_value FROM user_sales_goals usg JOIN sales_goals sg ON usg.goal_id = sg.id WHERE usg.user_id = $1', [userId]);
        // Get earned badges
        const badgesRes = await client.query('SELECT b.name, b.icon_url, ub.earned_at FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = $1 ORDER BY ub.earned_at DESC', [userId]);
        // Placeholder for commissions
        const commissions = [
            { id: 1, saleId: 123, amount: 50.25, date: '2025-10-28' },
            { id: 2, saleId: 124, amount: 25.0, date: '2025-10-29' },
        ];
        return {
            totalSales: parseFloat(salesRes.rows[0].total_sales) || 0,
            numSales: parseInt(salesRes.rows[0].num_sales) || 0,
            numRepairs: parseInt(repairsRes.rows[0].num_repairs) || 0,
            goals: goalsRes.rows,
            badges: badgesRes.rows,
            commissions: commissions,
        };
    }
    finally {
        client.release();
    }
};
