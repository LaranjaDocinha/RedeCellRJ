import { getPool } from '../db/index.js';

export const createShift = async (shiftData: any) => {
  const { user_id, branch_id, start_time, end_time, role } = shiftData;
  const result = await getPool().query(
    'INSERT INTO shifts (user_id, branch_id, start_time, end_time, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [user_id, branch_id, start_time, end_time, role],
  );
  return result.rows[0];
};

export const getShifts = async (start: string, end: string, branchId?: number) => {
  let query =
    'SELECT s.*, u.name as user_name FROM shifts s JOIN users u ON s.user_id = u.id WHERE s.start_time >= $1 AND s.end_time <= $2';
  const params = [start, end];

  if (branchId) {
    query += ' AND s.branch_id = $3';
    params.push(branchId.toString());
  }

  const result = await getPool().query(query, params);
  return result.rows;
};

export const updateShift = async (id: number, shiftData: any) => {
  const { user_id, branch_id, start_time, end_time, role } = shiftData;
  const result = await getPool().query(
    'UPDATE shifts SET user_id = $1, branch_id = $2, start_time = $3, end_time = $4, role = $5 WHERE id = $6 RETURNING *',
    [user_id, branch_id, start_time, end_time, role, id],
  );
  return result.rows[0];
};

export const deleteShift = async (id: number) => {
  await getPool().query('DELETE FROM shifts WHERE id = $1', [id]);
};
