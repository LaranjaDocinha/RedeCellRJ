import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface Setting {
  key: string;
  value: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SettingsRepository {
  private get db(): Pool {
    return getPool();
  }

  async findAll(): Promise<Setting[]> {
    const result = await this.db.query('SELECT key, value, description FROM settings');
    return result.rows;
  }

  async findByKey(key: string): Promise<Setting | undefined> {
    const result = await this.db.query('SELECT * FROM settings WHERE key = $1', [key]);
    return result.rows[0];
  }

  async create(data: Setting): Promise<Setting> {
    const result = await this.db.query(
      'INSERT INTO settings (key, value, description) VALUES ($1, $2, $3) RETURNING *',
      [data.key, data.value, data.description],
    );
    return result.rows[0];
  }

  async update(key: string, data: Partial<Setting>): Promise<Setting | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && k !== 'key') {
        fields.push(`${k} = $${paramIndex++}`);
        values.push(v);
      }
    }

    if (fields.length === 0) return this.findByKey(key);

    values.push(key);
    const query = `UPDATE settings SET ${fields.join(', ')}, updated_at = current_timestamp WHERE key = $${paramIndex} RETURNING *`;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.db.query('DELETE FROM settings WHERE key = $1', [key]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const settingsRepository = new SettingsRepository();
