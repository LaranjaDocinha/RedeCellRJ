import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from '../../../src/services/notificationService.js';
import { whatsappService } from '../../../src/services/whatsappService.js';

// Usando vi.hoisted para garantir que o mock seja criado antes da importação
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: mocks.query,
  },
  __esModule: true,
}));

vi.mock('../../../src/services/whatsappService.js', () => ({
  whatsappService: {
    sendTemplateMessage: vi.fn(),
  },
}));

// Mock do logger
vi.mock('../../../src/utils/logger.js', () => ({
  logger: mocks.logger,
}));

describe('NotificationService', () => {
  beforeEach(() => {
    mocks.query.mockReset();
    vi.mocked(whatsappService.sendTemplateMessage).mockReset();
    mocks.logger.warn.mockReset(); // Resetar o logger também
  });

  describe('sendNotification', () => {
    it('should send whatsapp notification if channel is selected and phone number exists', async () => {
      const payload = {
        recipientId: 1,
        recipientType: 'customer' as const,
        type: 'test_alert',
        templateName: 'test_template',
        variables: { name: 'John' },
        channels: ['whatsapp'] as const,
      };

      // Mock getRecipientPhoneNumber -> returns a phone number
      mocks.query.mockResolvedValueOnce({ rows: [{ phone: '5511999999999' }] });

      await notificationService.sendNotification(payload);

      expect(mocks.query).toHaveBeenCalledWith('SELECT phone FROM customers WHERE id = $1', [1]);
      expect(whatsappService.sendTemplateMessage).toHaveBeenCalledWith({
        customerId: 1,
        phone: '5511999999999',
        templateName: 'test_template',
        variables: { name: 'John' },
      });
    });

    it('should not send whatsapp notification if phone number is missing', async () => {
      const payload = {
        recipientId: 1,
        recipientType: 'user' as const,
        type: 'alert',
        templateName: 'tpl',
        variables: {},
        channels: ['whatsapp'] as const,
      };

      // Mock getRecipientPhoneNumber -> returns empty
      mocks.query.mockResolvedValueOnce({ rows: [] });

      await notificationService.sendNotification(payload);

      expect(mocks.query).toHaveBeenCalledWith('SELECT phone FROM users WHERE id = $1', [1]);
      expect(whatsappService.sendTemplateMessage).not.toHaveBeenCalled();
    });

    it('should log warning for unimplemented channels', async () => {
      const payload = {
        recipientId: 1,
        recipientType: 'customer' as const,
        type: 'test',
        channels: ['email', 'push'] as const,
      };

      await notificationService.sendNotification(payload);

      expect(mocks.logger.warn).toHaveBeenCalledWith('Email channel not implemented yet.');
      expect(mocks.logger.warn).toHaveBeenCalledWith('Push channel not implemented yet.');
    });
  });

  describe('getRecipientPhoneNumber', () => {
    it('should return phone for customer', async () => {
      mocks.query.mockResolvedValueOnce({ rows: [{ phone: '123' }] });
      const phone = await notificationService.getRecipientPhoneNumber(1, 'customer');
      expect(phone).toBe('123');
      expect(mocks.query).toHaveBeenCalledWith('SELECT phone FROM customers WHERE id = $1', [1]);
    });

    it('should return phone for user', async () => {
      mocks.query.mockResolvedValueOnce({ rows: [{ phone: '456' }] });
      const phone = await notificationService.getRecipientPhoneNumber(2, 'user');
      expect(phone).toBe('456');
      expect(mocks.query).toHaveBeenCalledWith('SELECT phone FROM users WHERE id = $1', [2]);
    });

    it('should return null if not found', async () => {
      mocks.query.mockResolvedValueOnce({ rows: [] });
      const phone = await notificationService.getRecipientPhoneNumber(1, 'customer');
      expect(phone).toBeNull();
    });
  });

  describe('getRecipientEmail', () => {
    it('should return email for customer', async () => {
      mocks.query.mockResolvedValueOnce({ rows: [{ email: 'cust@test.com' }] });
      const email = await notificationService.getRecipientEmail(1, 'customer');
      expect(email).toBe('cust@test.com');
      expect(mocks.query).toHaveBeenCalledWith('SELECT email FROM customers WHERE id = $1', [1]);
    });

    it('should return email for user', async () => {
      mocks.query.mockResolvedValueOnce({ rows: [{ email: 'user@test.com' }] });
      const email = await notificationService.getRecipientEmail(2, 'user');
      expect(email).toBe('user@test.com');
      expect(mocks.query).toHaveBeenCalledWith('SELECT email FROM users WHERE id = $1', [2]);
    });
  });
});
