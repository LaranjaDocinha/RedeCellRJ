import pool from '../db/index.js';
import { whatsappService } from './whatsappService.js';
import { logger } from '../utils/logger.js';

export const marketingAutomationService = {
  /**
   * Executa a rotina de re-engajamento baseada no segmento RFM.
   */
  async runReengagementCampaign() {
    logger.info('Iniciando Campanha de Re-engajamento RFM...');

    try {
      // 1. Busca clientes Hibernando ou Em Risco que não receberam mensagens nos últimos 7 dias
      const { rows: targets } = await pool.query(`
        SELECT c.id, c.name, c.phone, c.rfm_segment
        FROM customers c
        LEFT JOIN whatsapp_logs wl ON c.id = wl.customer_id AND wl.sent_at >= NOW() - INTERVAL '7 days'
        WHERE c.rfm_segment IN ('Hibernando', 'Em Risco')
        AND c.phone IS NOT NULL
        AND wl.id IS NULL
        LIMIT 20;
      `);

      for (const customer of targets) {
        const couponCode = `VOLTE${Math.floor(Math.random() * 1000)}`;

        logger.info(`Disparando automação para ${customer.name} (${customer.rfm_segment})`);

        await whatsappService.queueTemplateMessage({
          phone: customer.phone,
          templateName: 'reengagement_offer',
          variables: {
            customerName: customer.name.split(' ')[0],
            discountCode: couponCode,
            benefit: '15% de desconto na sua próxima visita',
          },
          customerId: customer.id,
        });
      }

      return { processed: targets.length };
    } catch (error) {
      logger.error('Erro na automação de marketing:', error);
      throw error;
    }
  },
};
