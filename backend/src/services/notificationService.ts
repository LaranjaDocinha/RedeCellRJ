import { logger } from '../utils/logger.js';
import { whatsappService } from './whatsappService.js';
import pool from '../db/index.js'; // Added import
// import { emailService } from './emailService.js'; // Future integration
// import { pushNotificationService } from './pushNotificationService.js'; // Future integration

interface NotificationPayload {
  recipientId: number; // User or Customer ID
  recipientType: 'user' | 'customer';
  type: string; // Ex: 'os_status_update', 'new_sale_alert', 'low_stock'
  templateName?: string; // For WhatsApp/Email templates
  variables?: Record<string, string | number>; // For template replacement
  message?: string; // For direct messages (e.g., push notification body)
  channels: ('whatsapp' | 'email' | 'push')[]; // Preferred channels
}

export const notificationService = {
  async sendNotification(payload: NotificationPayload) {
    logger.info(`Sending notification for ${payload.type} to ${payload.recipientType} ${payload.recipientId} via channels: ${payload.channels.join(', ')}`);

    for (const channel of payload.channels) {
      try {
        switch (channel) {
          case 'whatsapp':
            if (payload.templateName && payload.variables) {
              // Get recipient's phone number
              const phoneNumber = await this.getRecipientPhoneNumber(payload.recipientId, payload.recipientType);
              if (phoneNumber) {
                await whatsappService.sendTemplateMessage({
                  customerId: payload.recipientType === 'customer' ? payload.recipientId : undefined,
                  phone: phoneNumber,
                  templateName: payload.templateName,
                  variables: payload.variables,
                });
                logger.info(`WhatsApp notification sent for ${payload.type}`);
              } else {
                logger.warn(`Could not find phone number for ${payload.recipientType} ${payload.recipientId} to send WhatsApp notification.`);
              }
            } else if (payload.message) {
                 // Future: Send direct message via whatsappService.deliverMessage if it becomes public
            }
            break;
          case 'email':
            // Future: Integrate with emailService
            // if (payload.templateName && payload.variables) {
            //   const emailAddress = await this.getRecipientEmail(payload.recipientId, payload.recipientType);
            //   if (emailAddress) {
            //     await emailService.sendTemplateEmail({
            //       to: emailAddress,
            //       templateName: payload.templateName,
            //       variables: payload.variables,
            //     });
            //   }
            // }
            logger.warn('Email channel not implemented yet.');
            break;
          case 'push':
            // Future: Integrate with pushNotificationService
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
    // This is a simplified lookup. In a real app, this would query the DB.
    if (type === 'customer') {
        const customerRes = await pool.query('SELECT phone FROM customers WHERE id = $1', [id]);
        return customerRes.rows[0]?.phone || null;
    } else if (type === 'user') {
        const userRes = await pool.query('SELECT phone FROM users WHERE id = $1', [id]);
        return userRes.rows[0]?.phone || null;
    }
    return null;
  },

  async getRecipientEmail(id: number, type: 'user' | 'customer'): Promise<string | null> {
    // This is a simplified lookup. In a real app, this would query the DB.
    if (type === 'customer') {
        const customerRes = await pool.query('SELECT email FROM customers WHERE id = $1', [id]);
        return customerRes.rows[0]?.email || null;
    } else if (type === 'user') {
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
        return userRes.rows[0]?.email || null;
    }
    return null;
  }
};