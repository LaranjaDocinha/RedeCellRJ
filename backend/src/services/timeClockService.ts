import { getPool } from '../db/index.js';

export const clockIn = async (userId: string, branchId: number) => {
  try {
    // Check for an open clock-in
    const existing = await getPool().query(
      'SELECT * FROM time_clock_entries WHERE user_id = $1 AND clock_out_time IS NULL',
      [userId],
    );
    if (existing.rows.length > 0) {
      throw new Error('User is already clocked in.');
    }

    const result = await getPool().query(
      'INSERT INTO time_clock_entries (user_id, branch_id, clock_in_time) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, branchId],
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in clockIn service:', error);
    throw error;
  }
};

export const clockOut = async (userId: string) => {
  const result = await getPool().query(
    'UPDATE time_clock_entries SET clock_out_time = NOW() WHERE user_id = $1 AND clock_out_time IS NULL RETURNING *',
    [userId],
  );
  if (result.rows.length === 0) {
    throw new Error('No open clock-in found for this user.');
  }
  return result.rows[0];
};

export const getUserTimeClockEntries = async (
  userId: string,
  startDate: string,
  endDate: string,
) => {
  const result = await getPool().query(
    'SELECT * FROM time_clock_entries WHERE user_id = $1 AND clock_in_time >= $2 AND clock_in_time <= $3 ORDER BY clock_in_time DESC',
    [userId, startDate, endDate],
  );
  return result.rows;
};

export const getBranchTimeClockEntries = async (
  branchId: number,
  startDate: string,
  endDate: string,
) => {
  const result = await getPool().query(
    'SELECT t.*, u.name as user_name FROM time_clock_entries t JOIN users u ON t.user_id = u.id WHERE t.branch_id = $1 AND t.clock_in_time >= $2 AND t.clock_in_time <= $3 ORDER BY t.clock_in_time DESC',
    [branchId, startDate, endDate],
  );
  return result.rows;
};

export const getLatestUserEntry = async (userId: string) => {
  const result = await getPool().query(
    'SELECT * FROM time_clock_entries WHERE user_id = $1 ORDER BY clock_in_time DESC LIMIT 1',
    [userId],
  );
  return result.rows[0];
};
