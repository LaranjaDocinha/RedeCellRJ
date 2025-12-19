import appEvents from '../events/appEvents.js';
import { notificationService } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';
import { ServiceOrder } from '../types/serviceOrder.js'; // Assuming ServiceOrder type

export const initNotificationEventListener = () => {
  // Listener para atualizações de status de Ordem de Serviço
  appEvents.on('os.status.updated', async ({ serviceOrder, oldStatus, newStatus, changedBy }) => {
    logger.info(`[NotificationEventListener] OS Status Updated Event: OS #${serviceOrder.id} changed from ${oldStatus} to ${newStatus}`);
    
    // Supondo que queremos notificar o cliente via WhatsApp
    // e o usuário (técnico/admin) via push/email (se implementados)
    try {
      // Notificar o cliente
      await notificationService.sendNotification({
        recipientId: serviceOrder.customer_id,
        recipientType: 'customer',
        type: 'os_status_update',
        templateName: 'os_status_changed', // Nome do template do WhatsApp
        variables: {
          os_id: serviceOrder.id,
          status: newStatus,
          // Outras variáveis relevantes, como nome do cliente, etc.
          // Para obter o nome do cliente, precisaríamos buscar no DB ou ter no objeto serviceOrder
        },
        channels: ['whatsapp'], // Definir canais padrão para este tipo de notificação
      });

      // Notificar o usuário interno (ex: técnico responsável)
      if (serviceOrder.user_id) { // Se a OS tiver um técnico atribuído
        await notificationService.sendNotification({
          recipientId: serviceOrder.user_id, // User ID
          recipientType: 'user',
          type: 'os_status_alert',
          message: `Ordem de Serviço #${serviceOrder.id} atualizada para ${newStatus}.`,
          channels: ['push'], // Ex: Notificação push para o técnico
        });
      }

    } catch (error) {
      logger.error(`[NotificationEventListener] Error processing os.status.updated event:`, error);
    }
  });

  // Exemplo de outro listener: Novo Lead criado
  appEvents.on('lead.created', async ({ lead }) => {
    logger.info(`[NotificationEventListener] New Lead Created Event: Lead #${lead.id} - ${lead.name}`);
    
    // Notificar o usuário atribuído ao lead ou um time de vendas
    if (lead.assignedTo) {
      await notificationService.sendNotification({
        recipientId: lead.assignedTo,
        recipientType: 'user',
        type: 'new_lead_assigned',
        message: `Você recebeu um novo lead: ${lead.name} (${lead.email}).`,
        channels: ['email', 'push'], // Canais preferenciais para notificar o usuário
      });
    } else {
        // Notificar um grupo padrão ou admin sobre o novo lead não atribuído
        // Ex: buscar id do admin ou de um role 'sales_manager'
    }
  });

  // Adicionar outros listeners conforme necessário para outros eventos
  // Ex: 'sale.created', 'low_stock', etc.
  logger.info('[NotificationEventListener] Initialized all event listeners for notifications.');
};
