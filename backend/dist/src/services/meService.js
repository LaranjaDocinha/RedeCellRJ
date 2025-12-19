import pool from '../db/index.js';
// Assumes userId is passed from an auth middleware
export const getMyProfile = async (userId) => {
    // This query would need to join users and customers tables
    const result = await pool.query('SELECT id, name, email, phone FROM users WHERE id = $1', [
        userId,
    ]);
    return result.rows[0];
};
export const getMySales = async (userId) => {
    const result = await pool.query('SELECT * FROM sales WHERE user_id = $1 ORDER BY sale_date DESC', [userId]);
    return result.rows;
};
export const getMyServiceOrders = async (userId) => {
    const result = await pool.query('SELECT * FROM service_orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
};
