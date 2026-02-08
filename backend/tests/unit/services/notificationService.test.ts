import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from '../../../src/services/notificationService.js';
import { whatsappService } from '../../../src/services/whatsappService.js';
import { notificationRepository } from '../../../src/repositories/notification.repository.js';
import { io } from '../../../src/app.js';

// Usando vi.hoisted para garantir que o mock seja criado antes da importação
const mocks = vi.hoisted(() => {
  const mQuery = vi.fn();
  const mPool = {
    query: mQuery,
    connect: vi.fn().mockResolvedValue({
      query: mQuery,
      release: vi.fn(),
    }),
  };
  return {
    query: mQuery,
    pool: mPool,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mocks.pool,
  getPool: () => mocks.pool,
  query: mocks.query,
}));

vi.mock('../../../src/repositories/notification.repository.js', () => ({
  notificationRepository: {
    create: vi.fn(),
    getCustomerPhone: vi.fn(),
    getUserPhone: vi.fn(),
    getCustomerEmail: vi.fn(),
    getUserEmail: vi.fn(),
    listByUser: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

vi.mock('../../../src/services/whatsappService.js', () => ({
  whatsappService: {
    sendTemplateMessage: vi.fn(),
  },
}));

vi.mock('../../../src/app.js', () => ({
  io: {
    emit: vi.fn(),
  },
}));

// Mock do logger
vi.mock('../../../src/utils/logger.js', () => ({
  logger: mocks.logger,
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('sendNotification', () => {
    const payload: any = {
      recipientId: 1,
      recipientType: 'user',
      type: 'alert',
      title: 'T',
      message: 'M',
      channels: ['in_app', 'whatsapp'],
      templateName: 'temp',
      variables: { v: 1 }
    };

    it('should send in_app and whatsapp notifications', async () => {
      vi.mocked(notificationRepository.create).mockResolvedValue({ id: 101 } as any);
      vi.mocked(notificationRepository.getUserPhone).mockResolvedValue('5511999999999');

      await notificationService.sendNotification(payload);

      expect(notificationRepository.create).toHaveBeenCalled();
      expect(io.emit).toHaveBeenCalledWith('notification:1', { id: 101 });
      expect(whatsappService.sendTemplateMessage).toHaveBeenCalled();
    });

    it('should handle errors in the channel loop gracefully', async () => {
      vi.mocked(notificationRepository.getUserPhone).mockResolvedValue('123');
      vi.mocked(whatsappService.sendTemplateMessage).mockRejectedValue(new Error('Fail'));

      await notificationService.sendNotification(payload);

      expect(mocks.logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send notification via whatsapp'), expect.any(Error));
    });

    it('should log warnings for unimplemented channels', async () => {
      await notificationService.sendNotification({
        ...payload,
        channels: ['email', 'push', 'unknown']
      });

      expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('Email channel not implemented'));
      expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('Push channel not implemented'));
      expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown notification channel'));
    });
  });

  describe('Recipient Info', () => {
    it('should get customer phone', async () => {
      vi.mocked(notificationRepository.getCustomerPhone).mockResolvedValue('123');
      const res = await notificationService.getRecipientPhoneNumber(1, 'customer');
      expect(res).toBe('123');
    });

    it('should get user phone', async () => {
      vi.mocked(notificationRepository.getUserPhone).mockResolvedValue('456');
      const res = await notificationService.getRecipientPhoneNumber(1, 'user');
      expect(res).toBe('456');
    });

    it('should get customer email', async () => {
      vi.mocked(notificationRepository.getCustomerEmail).mockResolvedValue('c@test.com');
      const res = await notificationService.getRecipientEmail(1, 'customer');
      expect(res).toBe('c@test.com');
    });

    it('should get user email', async () => {
      vi.mocked(notificationRepository.getUserEmail).mockResolvedValue('u@test.com');
      const res = await notificationService.getRecipientEmail(1, 'user');
      expect(res).toBe('u@test.com');
    });
  });

  describe('Management Methods', () => {
    it('should list notifications', async () => {
      vi.mocked(notificationRepository.listByUser).mockResolvedValue([]);
      await notificationService.listUserNotifications('u1');
      expect(notificationRepository.listByUser).toHaveBeenCalledWith('u1');
    });

    it('should mark as read', async () => {
      await notificationService.markAsRead(1, 'u1');
      expect(notificationRepository.markAsRead).toHaveBeenCalledWith(1, 'u1');
    });

    it('should mark all as read', async () => {
      await notificationService.markAllAsRead('u1');
      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith('u1');
    });
  });
});
