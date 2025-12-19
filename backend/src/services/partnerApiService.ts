import { getPool } from '../db/index.js';
import crypto from 'crypto';

export const createApiKey = async (partnerName: string, permissions: any, expiresAt?: string) => {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const result = await getPool().query(
    'INSERT INTO partner_api_keys (partner_name, api_key, permissions, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [partnerName, apiKey, permissions, expiresAt],
  );
  return result.rows[0];
};

export const revokeApiKey = async (id: number) => {
  const result = await getPool().query(
    'UPDATE partner_api_keys SET is_active = FALSE WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0];
};

export const getApiKeys = async () => {
  const result = await getPool().query(
    'SELECT id, partner_name, permissions, is_active, created_at, expires_at FROM partner_api_keys ORDER BY created_at DESC',
  );
  return result.rows;
};

export const authenticateApiKey = async (apiKey: string) => {
  const result = await getPool().query(
    'SELECT * FROM partner_api_keys WHERE api_key = $1 AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())',
    [apiKey],
  );
  return result.rows[0];
};
