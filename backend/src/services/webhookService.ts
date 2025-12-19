import { getPool } from '../db/index.js';
import crypto from 'crypto';
import axios from 'axios';

export const createWebhook = async (eventType: string, callbackUrl: string, secret?: string) => {
  const result = await getPool().query(
    'INSERT INTO webhooks (event_type, callback_url, secret) VALUES ($1, $2, $3) RETURNING *',
    [eventType, callbackUrl, secret],
  );
  return result.rows[0];
};

export const updateWebhookStatus = async (id: number, isActive: boolean) => {
  const result = await getPool().query(
    'UPDATE webhooks SET is_active = $1 WHERE id = $2 RETURNING *',
    [isActive, id],
  );
  return result.rows[0];
};

export const deleteWebhook = async (id: number) => {
  const result = await getPool().query('DELETE FROM webhooks WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const getWebhooks = async () => {
  const result = await getPool().query('SELECT * FROM webhooks ORDER BY created_at DESC');
  return result.rows;
};

export const triggerWebhook = async (eventType: string, payload: any) => {
  const webhooks = await getPool().query(
    'SELECT * FROM webhooks WHERE event_type = $1 AND is_active = TRUE',
    [eventType],
  );

  for (const webhook of webhooks.rows) {
    try {
      const signature = webhook.secret
        ? crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex')
        : '';
      await axios.post(webhook.callback_url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
      });
      console.log(`Webhook triggered successfully for ${eventType} to ${webhook.callback_url}`);
    } catch (error) {
      console.error(`Error triggering webhook for ${eventType} to ${webhook.callback_url}:`, error);
    }
  }
};
