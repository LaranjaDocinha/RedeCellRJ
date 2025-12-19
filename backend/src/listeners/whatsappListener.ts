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
        
        // Conversão segura de ID (pode ser string ou number)
        const customerId = typeof sale.customerId === 'string' ? parseInt(sale.customerId) : sale.customerId;

        const customer = await customerService.getCustomerById(customerId);
        if (!customer || !customer.phone) {
            logger.info(`[WhatsappListener] Customer ${customerId} has no phone. Skipping notification.`);
            return;
        }

        logger.info(`[WhatsappListener] Sending sale confirmation to ${customer.phone}`);

        // Enviar Whatsapp
        await whatsappService.sendTemplateMessage({
            customerId: customerId,
            phone: customer.phone,
            templateName: 'sale_created',
            variables: {
                name: customer.name.split(' ')[0], // Primeiro nome
                total: Number(sale.total_amount).toFixed(2)
            }
        });
    } catch (err) {
        logger.error('Error in whatsappListener for sale.created:', err);
    }
  });

  // Evento: OS Criada (Futuro)
  // appEvents.on('service_order.created', ...);
};

export default whatsappListener;
