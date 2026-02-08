import { logger } from '../utils/logger.js';
import { whatsappService } from './whatsappService.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { io } from '../app.js';

interface NotificationPayload {
  recipientId: string | number; // User ID (UUID) or Customer ID (Serial)
  recipientType: 'user' | 'customer';
  type: string;
  templateName?: string;
  variables?: Record<string, string | number>;
  message?: string;
  title?: string;
  link?: string;
  channels: ('whatsapp' | 'email' | 'push' | 'in_app')[];
}

export const notificationService = {
  /**
   * Envia uma notificação multicanal.
   */
  async sendNotification(payload: NotificationPayload) {
    logger.info(
      `Sending notification for ${payload.type} to ${payload.recipientType} ${payload.recipientId} via channels: ${payload.channels.join(', ')}`,
    );

    // 1. Persistência In-App (Apenas para usuários)
    let dbNotification = null;
    if (payload.channels.includes('in_app') && payload.recipientType === 'user') {
      dbNotification = await notificationRepository.create({
        user_id: String(payload.recipientId),
        title: payload.title || 'Notificação do Sistema',
        message: payload.message || '',
        type: payload.type,
        link: payload.link,
        metadata: payload.variables,
      });

      // Emitir via Socket.io para tempo real
      io.emit(`notification:${payload.recipientId}`, dbNotification);
    }

    for (const channel of payload.channels) {
      try {
        switch (channel) {
          case 'in_app':
            // Processado separadamente para garantir o Socket.io
            break;
          case 'whatsapp':
            if (payload.templateName && payload.variables) {
              const phoneNumber = await this.getRecipientPhoneNumber(
                Number(payload.recipientId),
                payload.recipientType,
              );
              if (phoneNumber) {
                await whatsappService.sendTemplateMessage({
                  customerId:
                    payload.recipientType === 'customer' ? Number(payload.recipientId) : undefined,
                  phone: phoneNumber,
                  templateName: payload.templateName,
                  variables: payload.variables,
                });
                logger.info(`WhatsApp notification sent for ${payload.type}`);
              }
            }
            break;
          case 'email':
            logger.warn('Email channel not implemented yet.');
            break;
          case 'push':
            logger.warn('Push channel not implemented yet.');
            break;
          default:
            logger.warn(`Unknown notification channel: ${channel}`);
        }
      } catch (error) {
        logger.error(`Failed to send notification via ${channel} for ${payload.type}:`, error);
      }
    }
  },

  async getRecipientPhoneNumber(id: number, type: 'user' | 'customer'): Promise<string | null> {
    if (type === 'customer') {
      return notificationRepository.getCustomerPhone(id);
    } else if (type === 'user') {
      return notificationRepository.getUserPhone(id);
    }
    return null;
  },

  async getRecipientEmail(id: number, type: 'user' | 'customer'): Promise<string | null> {
    if (type === 'customer') {
      return notificationRepository.getCustomerEmail(id);
    } else if (type === 'user') {
      return notificationRepository.getUserEmail(id);
    }
    return null;
  },

  async listUserNotifications(userId: string) {
    return notificationRepository.listByUser(userId);
  },

  async markAsRead(id: number, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  },

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  },
};
