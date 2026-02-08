import pool from '../db/index.js';

export const userMoodService = {
  async recordMood(userId: string, moodLevel: number, comment?: string) {
    const res = await pool.query(
      'INSERT INTO user_mood_logs (user_id, mood_level, comment) VALUES ($1, $2, $3) RETURNING *',
      [userId, moodLevel, comment],
    );
    return res.rows[0];
  },

  async hasCheckedInToday(userId: string) {
    const res = await pool.query(
      'SELECT id FROM user_mood_logs WHERE user_id = $1 AND created_at::date = CURRENT_DATE',
      [userId],
    );
    return res.rows.length > 0;
  },
};
