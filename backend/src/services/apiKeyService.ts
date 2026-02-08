import pool from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import crypto from 'crypto';

interface ApiKey {
  id: number;
  key: string;
  user_id: string;
  name: string;
  permissions: any; // JSONB
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateApiKeyPayload {
  user_id: string;
  name: string;
  permissions: any;
  expires_at?: Date;
}

interface UpdateApiKeyPayload {
  name?: string;
  permissions?: any;
  expires_at?: Date;
  is_active?: boolean;
}

export const apiKeyService = {
  async generateApiKey(payload: CreateApiKeyPayload): Promise<{ rawKey: string; apiKey: ApiKey }> {
    const rawKey = crypto.randomBytes(32).toString('hex'); // Generate a random 64-char hex key
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex'); // Hash it for storage

    const { user_id, name, permissions, expires_at } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO api_keys (key, user_id, name, permissions, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [hashedKey, user_id, name, permissions, expires_at],
      );
      return { rawKey, apiKey: result.rows[0] };
    } catch (_error: any) {
      throw new AppError('Failed to generate API Key.', 500);
    }
  },

  async getApiKeyById(id: number): Promise<ApiKey | undefined> {
    const result = await pool.query('SELECT * FROM api_keys WHERE id = $1', [id]);
    return result.rows[0];
  },

  async getApiKeyByRawKey(rawKey: string): Promise<ApiKey | undefined> {
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    const result = await pool.query(
      'SELECT * FROM api_keys WHERE key = $1 AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())',
      [hashedKey],
    );
    return result.rows[0];
  },

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const result = await pool.query(
      'SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows;
  },

  async updateApiKey(id: number, payload: UpdateApiKeyPayload): Promise<ApiKey> {
    const { name, permissions, expires_at, is_active } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (permissions !== undefined) {
      fields.push(`permissions = $${paramIndex++}`);
      values.push(permissions);
    }
    if (expires_at !== undefined) {
      fields.push(`expires_at = $${paramIndex++}`);
      values.push(expires_at);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (fields.length === 0) {
      const existing = await this.getApiKeyById(id);
      if (!existing) throw new NotFoundError('API Key not found.');
      return existing; // No fields to update
    }

    values.push(id);
    const query = `UPDATE api_keys SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new NotFoundError('API Key not found.');
    }
    return result.rows[0];
  },

  async deleteApiKey(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM api_keys WHERE id = $1', [id]);
    return result.rowCount > 0;
  },
};
