import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface PushSubscription {
  id?: number;
  user_id: string;
  subscription: any;
  created_at?: Date;
}

export class NotificationRepository {
  private get db(): Pool {
    return getPool();
  }

  // Push Subscriptions
  async findSubscription(userId: string, endpoint: string): Promise<PushSubscription | undefined> {
    const result = await this.db.query(
      "SELECT * FROM user_push_subscriptions WHERE user_id = $1 AND (subscription->>'endpoint') = $2",
      [userId, endpoint],
    );
    return result.rows[0];
  }

  async createSubscription(userId: string, subscription: any): Promise<PushSubscription> {
    const result = await this.db.query(
      'INSERT INTO user_push_subscriptions (user_id, subscription) VALUES ($1, $2) RETURNING *',
      [userId, subscription],
    );
    return result.rows[0];
  }

  async deleteSubscription(userId: string | null, endpoint: string): Promise<boolean> {
    // If userId is null, delete by endpoint only (for cleanup tasks)
    let query = "DELETE FROM user_push_subscriptions WHERE (subscription->>'endpoint') = $1";
    const params: any[] = [endpoint];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await this.db.query(query, params);
    return (result?.rowCount ?? 0) > 0;
  }

  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    const result = await this.db.query('SELECT * FROM user_push_subscriptions WHERE user_id = $1', [
      userId,
    ]);
    return result.rows;
  }

  async getAllSubscriptions(): Promise<PushSubscription[]> {
    const result = await this.db.query('SELECT * FROM user_push_subscriptions');
    return result.rows;
  }

  // Contact Info Lookup
  async getCustomerPhone(customerId: number): Promise<string | null> {
    const result = await this.db.query('SELECT phone FROM customers WHERE id = $1', [customerId]);
    return result.rows[0]?.phone || null;
  }

  async getUserPhone(userId: number | string): Promise<string | null> {
    const result = await this.db.query('SELECT phone FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.phone || null;
  }

  async getCustomerEmail(customerId: number): Promise<string | null> {
    const result = await this.db.query('SELECT email FROM customers WHERE id = $1', [customerId]);
    return result.rows[0]?.email || null;
  }

  async getUserEmail(userId: number | string): Promise<string | null> {
    const result = await this.db.query('SELECT email FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.email || null;
  }

  // Persistent Notifications
  async create(data: {
    user_id: string | null;
    title: string;
    message: string;
    type?: string;
    priority?: string;
    link?: string;
    metadata?: any;
  }) {
    const { user_id, title, message, type, priority, link, metadata } = data;
    const result = await this.db.query(
      `INSERT INTO notifications (user_id, title, message, type, priority, link, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user_id,
        title,
        message,
        type || 'info',
        priority || 'normal',
        link,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async listByUser(userId: string, limit = 50) {
    const result = await this.db.query(
      'SELECT * FROM notifications WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC LIMIT $2',
      [userId, limit],
    );
    return result.rows;
  }

  async markAsRead(id: number, userId: string) {
    const result = await this.db.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING *',
      [id, userId],
    );
    return result.rows[0];
  }

  async markAllAsRead(userId: string) {
    await this.db.query(
      'UPDATE notifications SET read = true WHERE (user_id = $1 OR user_id IS NULL) AND read = false',
      [userId],
    );
  }
}

export const notificationRepository = new NotificationRepository();
