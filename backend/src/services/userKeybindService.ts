import pool from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';

interface UserKeybind {
  id: number;
  user_id: string;
  action_name: string;
  key_combination: string;
  context: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateKeybindPayload {
  user_id: string;
  action_name: string;
  key_combination: string;
  context?: string;
}

interface UpdateKeybindPayload {
  key_combination?: string;
  context?: string;
}

export const userKeybindService = {
  async getUserKeybinds(userId: string, context?: string): Promise<UserKeybind[]> {
    const queryParams: any[] = [userId];
    let whereClause = 'WHERE user_id = $1';
    let paramIndex = 2;

    if (context) {
      whereClause += ` AND context = $${paramIndex++}`;
      queryParams.push(context);
    }

    const result = await pool.query(`SELECT * FROM user_keybinds ${whereClause}`, queryParams);
    return result.rows;
  },

  async createKeybind(payload: CreateKeybindPayload): Promise<UserKeybind> {
    const { user_id, action_name, key_combination, context = 'global' } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO user_keybinds (user_id, action_name, key_combination, context) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, action_name, key_combination, context],
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new AppError('Keybind for this action and user already exists.', 409);
      }
      throw error;
    }
  },

  async updateKeybind(id: number, payload: UpdateKeybindPayload): Promise<UserKeybind> {
    const { key_combination, context } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (key_combination !== undefined) {
      fields.push(`key_combination = $${paramIndex++}`);
      values.push(key_combination);
    }
    if (context !== undefined) {
      fields.push(`context = $${paramIndex++}`);
      values.push(context);
    }

    if (fields.length === 0) {
      throw new AppError('No fields to update.', 400);
    }

    values.push(id);
    const query = `UPDATE user_keybinds SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new NotFoundError('Keybind not found.');
    }
    return result.rows[0];
  },

  async deleteKeybind(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM user_keybinds WHERE id = $1', [id]);
    return result.rowCount > 0;
  },
};
