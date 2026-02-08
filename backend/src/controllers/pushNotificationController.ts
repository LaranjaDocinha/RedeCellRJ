import { Request, Response } from 'express';
import { pushNotificationService } from '../services/pushNotificationService.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

// Zod schema for PushSubscription
const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.union([z.number(), z.null()]).optional(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// Zod schema for Notification Payload
const notificationPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().url().optional(),
  url: z.string().url().optional(),
});

export const pushNotificationController = {
  async getPublicKey(req: Request, res: Response) {
    try {
      const publicKey = pushNotificationService.getVapidPublicKey();
      if (!publicKey) {
        return res.status(500).json({ message: 'VAPID public key not configured on server.' });
      }
      res.json({ publicKey });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async subscribe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id; // User ID from auth middleware
      const subscription = pushSubscriptionSchema.parse(req.body);

      await pushNotificationService.subscribeUser(userId, subscription);
      res.status(201).json({ message: 'Subscription successful.' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      if (error instanceof AppError && error.statusCode === 409) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  async unsubscribe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ message: 'Subscription endpoint is required.' });
      }
      await pushNotificationService.unsubscribeUser(userId, endpoint);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async sendNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id; // User ID from auth middleware
      const payload = notificationPayloadSchema.parse(req.body);

      // For testing, send to current user. For real use, it would be another endpoint
      await pushNotificationService.sendNotificationToUser(
        userId,
        payload.title,
        payload.body,
        payload.icon,
        payload.url,
      );
      res.status(200).json({ message: 'Notification sent (to current user).' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  },

  async sendBroadcastNotification(req: Request, res: Response) {
    try {
      // Requires admin/broadcast permission
      const payload = notificationPayloadSchema.parse(req.body);
      await pushNotificationService.sendNotificationToAll(
        payload.title,
        payload.body,
        payload.icon,
        payload.url,
      );
      res.status(200).json({ message: 'Broadcast notification sent.' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  },
};
