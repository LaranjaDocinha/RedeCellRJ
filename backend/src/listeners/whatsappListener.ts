import appEvents from '../events/appEvents.js';
import { whatsappService } from '../services/whatsappService.js';
import { logger } from '../utils/logger.js';
import { customerService } from '../services/customerService.js';

const whatsappListener = () => {
  // Evento: Venda Criada
  appEvents.on('sale.created', async (payload: any) => {
    try {
      const { sale } = payload;
      if (!sale || !sale.customerId) return;

      const customerId =
        typeof sale.customerId === 'string' ? parseInt(sale.customerId) : sale.customerId;

      const customer = await customerService.getCustomerById(customerId);
      if (!customer || !customer.phone) {
        logger.info(
          `[WhatsappListener] Customer ${customerId} has no phone. Skipping notification.`,
        );
        return;
      }

      logger.info(`[WhatsappListener] Sending sale confirmation to ${customer.phone}`);

      await whatsappService.sendTemplateMessage({
        customerId: customerId,
        phone: customer.phone,
        templateName: 'sale_created',
        variables: {
          name: customer.name.split(' ')[0],
          total: Number(sale.total_amount).toFixed(2),
        },
      });
    } catch (err) {
      logger.error('Error in whatsappListener for sale.created:', err);
    }
  });

  // Evento: Status da OS Atualizado
  appEvents.on('os.status.updated', async (payload: any) => {
    try {
      const { serviceOrder, newStatus } = payload;
      if (!serviceOrder || !serviceOrder.customer_id) return;

      const customerId = serviceOrder.customer_id;
      const customer = await customerService.getCustomerById(customerId);

      if (!customer || !customer.phone) {
        logger.info(
          `[WhatsappListener] Customer ${customerId} has no phone. Skipping OS notification.`,
        );
        return;
      }

      logger.info(`[WhatsappListener] Sending OS status update to ${customer.phone}`);

      // Construct public tracking link (assuming frontend runs on port 5173 or env var)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const trackingLink = `${frontendUrl}/portal/${serviceOrder.public_token || 'auth'}`;

      await whatsappService.sendTemplateMessage({
        customerId: customerId,
        phone: customer.phone,
        templateName: 'os_status_updated',
        variables: {
          name: customer.name.split(' ')[0],
          os_id: serviceOrder.id,
          status: newStatus,
          link: trackingLink,
        },
      });
    } catch (err) {
      logger.error('Error in whatsappListener for os.status.updated:', err);
    }
  });
};

export default whatsappListener;
