import pool from '../db/index.js';

const DEFAULT_DASHBOARD_SETTINGS = {
  widgets: [
    { id: 'totalSales', visible: true, order: 0 },
    { id: 'salesByMonthChart', visible: true, order: 1 },
    { id: 'topSellingProductsChart', visible: true, order: 2 },
  ],
};

export const getSettings = async (userId: number) => {
  const { rows } = await pool.query(
    'SELECT settings FROM user_dashboard_settings WHERE user_id = $1',
    [userId]
  );

  if (rows.length > 0) {
    return rows[0].settings;
  } else {
    // If no settings exist, return default and create an entry for the user
    await pool.query(
      'INSERT INTO user_dashboard_settings (user_id, settings) VALUES ($1, $2)',
      [userId, DEFAULT_DASHBOARD_SETTINGS]
    );
    return DEFAULT_DASHBOARD_SETTINGS;
  }
};

export const updateSettings = async (userId: number, newSettings: any) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'UPDATE user_dashboard_settings SET settings = $1, updated_at = NOW() WHERE user_id = $2 RETURNING settings',
      [newSettings, userId]
    );

    if (rows.length === 0) {
      // If no entry existed, create one (this case should ideally be handled by getSettings first)
      const { rows: newEntry } = await client.query(
        'INSERT INTO user_dashboard_settings (user_id, settings) VALUES ($1, $2) RETURNING settings',
        [userId, newSettings]
      );
      await client.query('COMMIT');
      return newEntry[0].settings;
    }
    await client.query('COMMIT');
    return rows[0].settings;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
