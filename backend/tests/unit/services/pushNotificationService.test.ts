import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pushNotificationService } from '../../../src/services/pushNotificationService.js';
import webPush from 'web-push';
import { AppError } from '../../../src/utils/errors.js';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: mocks.query,
  },
  __esModule: true,
}));

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

describe('PushNotificationService', () => {
  beforeEach(() => {
    mocks.query.mockReset();
    vi.mocked(webPush.sendNotification).mockReset();
  });

  describe('getVapidPublicKey', () => {
    it('should return the VAPID public key', () => {
      // Assuming env vars are mocked or set in setup
      const key = pushNotificationService.getVapidPublicKey();
      expect(key).toBeUndefined(); // Or value if set in env
    });
  });

  describe('subscribeUser', () => {
    const sub = { endpoint: 'http://endpoint.com', keys: { p256dh: 'k1', auth: 'k2' } };

    it('should subscribe a user successfully', async () => {
      // Mock existing check: empty
      mocks.query.mockResolvedValueOnce({ rows: [] });
      // Mock insert
      const newSub = { id: 1, user_id: 'u1', subscription: sub };
      mocks.query.mockResolvedValueOnce({ rows: [newSub] });

      const result = await pushNotificationService.subscribeUser('u1', sub);
      expect(result).toEqual(newSub);
      expect(mocks.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_push_subscriptions'),
        ['u1', sub]
      );
    });

    it('should return existing subscription if already subscribed', async () => {
      const existingSub = { id: 1, user_id: 'u1' };
      mocks.query.mockResolvedValueOnce({ rows: [existingSub] });

      const result = await pushNotificationService.subscribeUser('u1', sub);
      expect(result).toEqual(existingSub);
      // Should not call INSERT
      expect(mocks.query).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError on unique constraint violation', async () => {
      mocks.query.mockResolvedValueOnce({ rows: [] }); // check pass
      const error: any = new Error('Unique violation');
      error.code = '23505';
      mocks.query.mockRejectedValueOnce(error); // insert fail

      await expect(pushNotificationService.subscribeUser('u1', sub)).rejects.toThrow(AppError);
    });
  });

  describe('unsubscribeUser', () => {
    it('should unsubscribe user', async () => {
      mocks.query.mockResolvedValueOnce({ rowCount: 1 });
      const result = await pushNotificationService.unsubscribeUser('u1', 'http://endpoint.com');
      expect(result).toBe(true);
      expect(mocks.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM user_push_subscriptions'),
        ['u1', 'http://endpoint.com']
      );
    });
  });

  describe('sendNotificationToUser', () => {
    it('should send notification to all user subscriptions', async () => {
      const subscriptions = [
        { subscription: { endpoint: 'e1' } },
        { subscription: { endpoint: 'e2' } },
      ];
      mocks.query.mockResolvedValueOnce({ rows: subscriptions });
      vi.mocked(webPush.sendNotification).mockResolvedValue({} as any);

      await pushNotificationService.sendNotificationToUser('u1', 'Title', 'Body');

      expect(webPush.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('should remove expired subscriptions (410)', async () => {
      const subscriptions = [{ subscription: { endpoint: 'e1' } }];
      mocks.query.mockResolvedValueOnce({ rows: subscriptions });
      
      const error: any = new Error('Gone');
      error.statusCode = 410;
      vi.mocked(webPush.sendNotification).mockRejectedValueOnce(error);
      mocks.query.mockResolvedValueOnce({ rowCount: 1 }); // Mock unsubscribe delete

      await pushNotificationService.sendNotificationToUser('u1', 'Title', 'Body');

      expect(webPush.sendNotification).toHaveBeenCalledTimes(1);
      // Should call delete
      expect(mocks.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM user_push_subscriptions'),
        ['u1', 'e1']
      );
    });
  });

  describe('sendNotificationToAll', () => {
    it('should send to all subscriptions', async () => {
      const subscriptions = [{ subscription: { endpoint: 'e1' } }];
      mocks.query.mockResolvedValueOnce({ rows: subscriptions });
      vi.mocked(webPush.sendNotification).mockResolvedValue({} as any);

      await pushNotificationService.sendNotificationToAll('Title', 'Body');

      expect(webPush.sendNotification).toHaveBeenCalledTimes(1);
    });
  });
});
