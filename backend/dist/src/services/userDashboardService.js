import { getPool } from '../db/index.js';
export const getSettings = async (userId) => {
    const { rows: [settings], } = await getPool().query('SELECT * FROM user_dashboard_settings WHERE user_id = $1', [userId]);
    return settings;
};
export const updateSettings = async (userId, newSettings) => {
    const { rows: [updatedSettings], } = await getPool().query('INSERT INTO user_dashboard_settings (user_id, settings) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = CURRENT_TIMESTAMP RETURNING *;', [userId, newSettings]);
    return updatedSettings;
};
