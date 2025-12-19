import { getPool } from '../db/index.js';
import { PoolClient } from 'pg';

export const createActivity = async (
  userId: string | null,
  branchId: number | null,
  activityType: string,
  activityData: any,
  client?: PoolClient,
) => {
  const db = client || getPool();
  const result = await db.query(
    'INSERT INTO activity_feed (user_id, branch_id, activity_type, activity_data) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, branchId, activityType, activityData],
  );
  return result.rows[0];
};

export const getFeed = async (branchId?: number, limit = 20, offset = 0) => {
  let query = `
    SELECT af.*, u.name as user_name
    FROM activity_feed af
    LEFT JOIN users u ON af.user_id = u.id
  `;
  const params = [];
  let paramIndex = 1;

  if (branchId) {
    query += ` WHERE af.branch_id = $${paramIndex++}`;
    params.push(branchId);
  }

  query += ` ORDER BY af.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await getPool().query(query, params);
  return result.rows;
};
