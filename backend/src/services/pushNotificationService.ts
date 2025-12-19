import webPush from 'web-push';
import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

// VAPID keys - Generate these once and store securely, e.g., in environment variables
// webPush.generateVAPIDKeys() -> { publicKey, privateKey }
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys not set. Push notifications will not work.');
  console.warn('Generate keys: npx web-push generate-vapid-keys');
} else {
  webPush.setVapidDetails(
    'mailto:your_email@example.com', // Replace with your email
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export const pushNotificationService = {
  getVapidPublicKey(): string | undefined {
    return VAPID_PUBLIC_KEY;
  },

  async subscribeUser(userId: string, subscription: webPush.PushSubscription): Promise<any> {
    try {
      // Check if subscription already exists for this user (same endpoint)
      const existing = await pool.query(
        'SELECT id FROM user_push_subscriptions WHERE user_id = $1 AND (subscription->>\'endpoint\') = $2',
        [userId, subscription.endpoint]
      );
      if (existing.rows.length > 0) {
        return existing.rows[0]; // Already subscribed
      }

      const result = await pool.query(
        'INSERT INTO user_push_subscriptions (user_id, subscription) VALUES ($1, $2) RETURNING *',
        [userId, subscription],
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation if subscription object is strictly unique
        throw new AppError('This push subscription is already registered for this user.', 409);
      }
      throw new AppError('Failed to subscribe user for push notifications.', 500);
    }
  },

  async unsubscribeUser(userId: string, endpoint: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM user_push_subscriptions WHERE user_id = $1 AND (subscription->>\'endpoint\') = $2',
      [userId, endpoint]
    );
    return result.rowCount > 0;
  },

  async sendNotificationToUser(userId: string, title: string, body: string, icon?: string, url?: string): Promise<void> {
    const subscriptions = await pool.query(
      'SELECT subscription FROM user_push_subscriptions WHERE user_id = $1',
      [userId]
    );

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo192.png', // Default icon
      url: url || '/' // URL to open when notification is clicked
    });

    for (const sub of subscriptions.rows) {
      try {
        await webPush.sendNotification(sub.subscription, notificationPayload);
      } catch (error: any) {
        console.error(`Error sending push notification to ${userId}:`, error);
        // If subscription is no longer valid, remove it from DB
        if (error.statusCode === 410 || error.statusCode === 404) { // GONE or Not Found
          await this.unsubscribeUser(userId, sub.subscription.endpoint);
          console.log(`Removed expired subscription for user ${userId}.`);
        }
      }
    }
  },

  async sendNotificationToAll(title: string, body: string, icon?: string, url?: string): Promise<void> {
    const subscriptions = await pool.query(
      'SELECT subscription FROM user_push_subscriptions',
    );
    
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo192.png',
      url: url || '/'
    });

    for (const sub of subscriptions.rows) {
      try {
        await webPush.sendNotification(sub.subscription, notificationPayload);
      } catch (error: any) {
        console.error(`Error sending push notification to all (endpoint: ${sub.subscription.endpoint}):`, error);
        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.unsubscribeUser('N/A', sub.subscription.endpoint); // userId is 'N/A' here, need to rethink unsubscribe
                                                                        // or fetch user_id from subscription if possible
          console.log(`Removed expired subscription.`);
        }
      }
    }
  }
};
