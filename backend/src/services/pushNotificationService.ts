import webPush from 'web-push';
import { AppError } from '../utils/errors.js';
import { notificationRepository } from '../repositories/notification.repository.js';

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
    VAPID_PRIVATE_KEY,
  );
}

export const pushNotificationService = {
  getVapidPublicKey(): string | undefined {
    return VAPID_PUBLIC_KEY;
  },

  async subscribeUser(userId: string, subscription: webPush.PushSubscription): Promise<any> {
    try {
      // Check if subscription already exists for this user (same endpoint)
      const existing = await notificationRepository.findSubscription(userId, subscription.endpoint);
      if (existing) {
        return existing; // Already subscribed
      }

      return notificationRepository.createSubscription(userId, subscription);
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique violation if subscription object is strictly unique
        throw new AppError('This push subscription is already registered for this user.', 409);
      }
      throw new AppError('Failed to subscribe user for push notifications.', 500);
    }
  },

  async unsubscribeUser(userId: string, endpoint: string): Promise<boolean> {
    return notificationRepository.deleteSubscription(userId, endpoint);
  },

  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    icon?: string,
    url?: string,
  ): Promise<void> {
    const subscriptions = await notificationRepository.getUserSubscriptions(userId);

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo192.png', // Default icon
      url: url || '/', // URL to open when notification is clicked
    });

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, notificationPayload);
      } catch (error: any) {
        console.error(`Error sending push notification to ${userId}:`, error);
        // If subscription is no longer valid, remove it from DB
        if (error.statusCode === 410 || error.statusCode === 404) {
          // GONE or Not Found
          await this.unsubscribeUser(userId, sub.subscription.endpoint);
          console.log(`Removed expired subscription for user ${userId}.`);
        }
      }
    }
  },

  async sendNotificationToAll(
    title: string,
    body: string,
    icon?: string,
    url?: string,
  ): Promise<void> {
    const subscriptions = await notificationRepository.getAllSubscriptions();

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo192.png',
      url: url || '/',
    });

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, notificationPayload);
      } catch (error: any) {
        console.error(
          `Error sending push notification to all (endpoint: ${sub.subscription.endpoint}):`,
          error,
        );
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Pass userId as null or handle generically in repo if userId unknown,
          // but repo method supports null userId to delete by endpoint only.
          await notificationRepository.deleteSubscription(null, sub.subscription.endpoint);
          console.log(`Removed expired subscription.`);
        }
      }
    }
  },
};
