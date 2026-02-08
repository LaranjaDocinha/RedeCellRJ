import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const notificationController = {
  listByUser: catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const notifications = await notificationService.listUserNotifications(userId);
    res.json(notifications);
  }),

  markAsRead: catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const notification = await notificationService.markAsRead(Number(id), userId);
    res.json(notification);
  }),

  markAllAsRead: catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true });
  }),
};
