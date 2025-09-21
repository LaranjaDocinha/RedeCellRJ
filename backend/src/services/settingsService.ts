import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateSettingPayload {
  key: string;
  value: string;
  description?: string;
}

interface UpdateSettingPayload {
  value?: string;
  description?: string;
}

class SettingsService {
  async getAllSettings(): Promise<Setting[]> {
    const result = await pool.query('SELECT * FROM settings');
    return result.rows;
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    const result = await pool.query('SELECT * FROM settings WHERE key = $1', [key]);
    return result.rows[0];
  }

  async createSetting(payload: CreateSettingPayload): Promise<Setting> {
    const { key, value, description } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO settings (key, value, description) VALUES ($1, $2, $3) RETURNING *'
        , [key, value, description]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Setting with this key already exists', 409);
      }
      throw error;
    }
  }

  async updateSetting(key: string, payload: UpdateSettingPayload): Promise<Setting | undefined> {
    const { value, description } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (value !== undefined) { fields.push(`value = $${paramIndex++}`); values.push(value); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }

    if (fields.length === 0) {
      const existingSetting = await this.getSettingByKey(key);
      if (!existingSetting) {
        return undefined; // No setting found to update
      }
      return existingSetting; // No fields to update, return existing setting
    }

    values.push(key); // Add key for WHERE clause
    const query = `UPDATE settings SET ${fields.join(', ')}, updated_at = current_timestamp WHERE key = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Setting with this key already exists', 409);
      }
      throw error;
    }
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM settings WHERE key = $1 RETURNING key', [key]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const settingsService = new SettingsService();