import { getPool } from '../db/index.js';

export const createBadge = async (badgeData: any) => {
  const { name, description, icon_url, metric, threshold } = badgeData;
  const result = await getPool().query(
    'INSERT INTO badges (name, description, icon_url, metric, threshold) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, description, icon_url, metric, threshold],
  );
  return result.rows[0];
};

export const getAllBadges = async () => {
  const result = await getPool().query('SELECT * FROM badges');
  return result.rows;
};

export const getBadgeById = async (id: number) => {
  const result = await getPool().query('SELECT * FROM badges WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateBadge = async (id: number, badgeData: any) => {
  const { name, description, icon_url, metric, threshold } = badgeData;
  const result = await getPool().query(
    'UPDATE badges SET name = $1, description = $2, icon_url = $3, metric = $4, threshold = $5, updated_at = current_timestamp WHERE id = $6 RETURNING *',
    [name, description, icon_url, metric, threshold, id],
  );
  return result.rows[0];
};

export const deleteBadge = async (id: number) => {
  await getPool().query('DELETE FROM badges WHERE id = $1', [id]);
};

export const checkAndAwardBadges = async () => {
  const pool = getPool();
  
  // Award 'sales_volume' badges
  await pool.query(`
    INSERT INTO user_badges (user_id, badge_id)
    SELECT u.id, b.id
    FROM users u
    CROSS JOIN badges b
    LEFT JOIN (
      SELECT user_id, SUM(total_amount) as total_sales
      FROM sales
      GROUP BY user_id
    ) s ON u.id = s.user_id
    WHERE b.metric = 'sales_volume' 
      AND s.total_sales >= b.threshold
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  `);

  // Award 'repairs_completed' badges
  await pool.query(`
    INSERT INTO user_badges (user_id, badge_id)
    SELECT u.id, b.id
    FROM users u
    CROSS JOIN badges b
    LEFT JOIN (
      SELECT technician_id as user_id, COUNT(id) as total_repairs
      FROM service_orders
      WHERE status = 'Entregue'
      GROUP BY technician_id
    ) r ON u.id = r.user_id
    WHERE b.metric = 'repairs_completed' 
      AND r.total_repairs >= b.threshold
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  `);
  
  console.log('Badges awarded successfully.');
};
