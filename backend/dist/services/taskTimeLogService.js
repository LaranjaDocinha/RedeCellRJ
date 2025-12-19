import { getPool } from '../db/index.js';
export const startTimer = async (userId, serviceOrderId) => {
    // Check for an open timer for this user and service order
    const existing = await getPool().query('SELECT * FROM task_time_log WHERE user_id = $1 AND service_order_id = $2 AND end_time IS NULL', [userId, serviceOrderId]);
    if (existing.rows.length > 0) {
        throw new Error('Timer is already running for this task.');
    }
    const result = await getPool().query('INSERT INTO task_time_log (user_id, service_order_id, start_time) VALUES ($1, $2, NOW()) RETURNING *', [userId, serviceOrderId]);
    return result.rows[0];
};
export const stopTimer = async (userId, serviceOrderId, notes) => {
    const result = await getPool().query('UPDATE task_time_log SET end_time = NOW(), notes = $3 WHERE user_id = $1 AND service_order_id = $2 AND end_time IS NULL RETURNING *', [userId, serviceOrderId, notes]);
    if (result.rows.length === 0) {
        throw new Error('No active timer found for this task.');
    }
    return result.rows[0];
};
export const getLogsForServiceOrder = async (serviceOrderId) => {
    const result = await getPool().query('SELECT ttl.*, u.name as user_name FROM task_time_log ttl JOIN users u ON ttl.user_id = u.id WHERE ttl.service_order_id = $1 ORDER BY ttl.start_time DESC', [serviceOrderId]);
    return result.rows;
};
export const getActiveTimerForUser = async (userId, serviceOrderId) => {
    const result = await getPool().query('SELECT * FROM task_time_log WHERE user_id = $1 AND service_order_id = $2 AND end_time IS NULL', [userId, serviceOrderId]);
    return result.rows[0];
};
