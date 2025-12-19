import { getPool } from '../db/index.js';

interface UserDashboardSettings {
  user_id: string;
  settings: any; // JSONB type
}

export const getSettings = async (userId: string): Promise<UserDashboardSettings | undefined> => {
  const {
    rows: [settings],
  } = await getPool().query<UserDashboardSettings>(
    'SELECT * FROM user_dashboard_settings WHERE user_id = $1',
    [userId],
  );
  return settings;
};

export const updateSettings = async (
  userId: string,
  newSettings: any,
): Promise<UserDashboardSettings> => {
  const {
    rows: [updatedSettings],
  } = await getPool().query<UserDashboardSettings>(
    'INSERT INTO user_dashboard_settings (user_id, settings) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = CURRENT_TIMESTAMP RETURNING *;',
    [userId, newSettings],
  );
  return updatedSettings;
};
