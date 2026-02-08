import { getPool } from '../db/index.js';
import { Pool } from 'pg';

export interface RefreshToken {
  id: number;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export class RefreshTokenRepository {
  private get db(): Pool {
    return getPool();
  }

  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const result = await this.db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt],
    );
    return result.rows[0];
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await this.db.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
    return result.rows[0] || null;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    return result.rowCount || 0;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
