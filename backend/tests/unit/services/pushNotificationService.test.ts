import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pushNotificationService } from '../../../src/services/pushNotificationService.js';
import { notificationRepository } from '../../../src/repositories/notification.repository.js';
import webPush from 'web-push';
import { AppError } from '../../../src/utils/errors.js';

vi.mock('web-push');
vi.mock('../../../src/repositories/notification.repository.js', () => ({
  notificationRepository: {
    findSubscription: vi.fn(),
    createSubscription: vi.fn(),
    deleteSubscription: vi.fn(),
    getUserSubscriptions: vi.fn(),
    getAllSubscriptions: vi.fn(),
  },
}));

describe('PushNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVapidPublicKey', () => {
    it('should return the VAPID public key', () => {
      const key = pushNotificationService.getVapidPublicKey();
      expect(key).toBe(process.env.VAPID_PUBLIC_KEY);
    });
  });

  describe('subscribeUser', () => {
    const sub = { endpoint: 'e1', keys: { auth: 'a', p256dh: 'p' } };

    it('should subscribe a user successfully', async () => {
      vi.mocked(notificationRepository.findSubscription).mockResolvedValue(undefined);
      vi.mocked(notificationRepository.createSubscription).mockResolvedValue({ id: 1 });

      const res = await pushNotificationService.subscribeUser('u1', sub as any);

      expect(res).toEqual({ id: 1 });
      expect(notificationRepository.createSubscription).toHaveBeenCalled();
    });

    it('should return existing subscription if already registered', async () => {
      vi.mocked(notificationRepository.findSubscription).mockResolvedValue({ id: 1 } as any);
      const res = await pushNotificationService.subscribeUser('u1', sub as any);
      expect(res).toEqual({ id: 1 });
      expect(notificationRepository.createSubscription).not.toHaveBeenCalled();
    });

    it('should throw AppError if subscription fails', async () => {
      vi.mocked(notificationRepository.findSubscription).mockRejectedValue(new Error('DB Fail'));
      await expect(pushNotificationService.subscribeUser('u1', sub as any)).rejects.toThrow(AppError);
    });
  });

  describe('unsubscribeUser', () => {
    it('should unsubscribe user', async () => {
      vi.mocked(notificationRepository.deleteSubscription).mockResolvedValue(true);
      const res = await pushNotificationService.unsubscribeUser('u1', 'e');
      expect(res).toBe(true);
    });
  });

  describe('sendNotificationToUser', () => {
    it('should send notifications to all user subscriptions', async () => {
      const subs = [{ subscription: { endpoint: 'e1' } }, { subscription: { endpoint: 'e2' } }];
      vi.mocked(notificationRepository.getUserSubscriptions).mockResolvedValue(subs as any);
      vi.mocked(webPush.sendNotification).mockResolvedValue({} as any);

      await pushNotificationService.sendNotificationToUser('u1', 'T', 'B');

      expect(webPush.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('should remove subscription if webPush returns 410 or 404', async () => {
      const subs = [{ subscription: { endpoint: 'e1' } }];
      vi.mocked(notificationRepository.getUserSubscriptions).mockResolvedValue(subs as any);
      const error = new Error('Expired');
      (error as any).statusCode = 410;
      vi.mocked(webPush.sendNotification).mockRejectedValue(error);

      await pushNotificationService.sendNotificationToUser('u1', 'T', 'B');

      expect(notificationRepository.deleteSubscription).toHaveBeenCalledWith('u1', 'e1');
    });
  });

  describe('sendNotificationToAll', () => {
    it('should send notifications to all subscriptions in DB', async () => {
      const subs = [{ subscription: { endpoint: 'e1' } }];
      vi.mocked(notificationRepository.getAllSubscriptions).mockResolvedValue(subs as any);
      vi.mocked(webPush.sendNotification).mockResolvedValue({} as any);

      await pushNotificationService.sendNotificationToAll('T', 'B');

      expect(webPush.sendNotification).toHaveBeenCalled();
    });

    it('should handle expired subscriptions when sending to all', async () => {
      const subs = [{ subscription: { endpoint: 'e1' } }];
      vi.mocked(notificationRepository.getAllSubscriptions).mockResolvedValue(subs as any);
      const error = new Error('Not Found');
      (error as any).statusCode = 404;
      vi.mocked(webPush.sendNotification).mockRejectedValue(error);

      await pushNotificationService.sendNotificationToAll('T', 'B');

      expect(notificationRepository.deleteSubscription).toHaveBeenCalledWith(null, 'e1');
    });
  });
});
