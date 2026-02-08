import appEvents from '../events/appEvents.js';
import { notificationService } from '../services/notificationService.js';
import { commissionService } from '../services/commissionService.js';
import { walletService } from '../services/walletService.js';
import { logger } from '../utils/logger.js';

export const initSystemNotificationListener = () => {
  // 1. Escutar Mudança de Status de OS
  appEvents.on('os.status.updated', async ({ serviceOrder, newStatus, _changedBy }) => {
    try {
      // Se a OS foi finalizada, avisar o criador da OS ou o gerente
      if (newStatus === 'Finalizado') {
        await notificationService.sendNotification({
          recipientId: serviceOrder.user_id, // Criador da OS
          recipientType: 'user',
          type: 'os',
          title: '🎉 OS Finalizada',
          message: `A Ordem de Serviço #${serviceOrder.id} (${serviceOrder.product_description}) foi concluída.`,
          link: `/service-orders/${serviceOrder.id}`,
          channels: ['in_app'],
        });
      }

      // Calcular Comissão se finalizada
      if (newStatus === 'Finalizado') {
        await commissionService.calculateForOS(serviceOrder);
      }
    } catch (error) {
      logger.error('Error in os.status.updated listener:', error);
    }
  });

  // 2. Escutar Venda Criada (Achievement/Incentivo)
  appEvents.on('sale.created', async ({ sale }) => {
    try {
      await notificationService.sendNotification({
        recipientId: sale.user_id,
        recipientType: 'user',
        type: 'sale',
        title: '💰 Nova Venda!',
        message: `Parabéns! Você acabou de realizar uma venda de R$ ${sale.total_amount}.`,
        channels: ['in_app'],
      });

      // Calcular Comissão
      await commissionService.calculateForSale(sale);

      // Cashback Automático (5%)
      if (sale.customer_id) {
        const cashback = Number(sale.total_amount) * 0.05;
        await walletService.addCredit(
          Number(sale.customer_id),
          cashback,
          'cashback',
          sale.id,
          'Cashback fidelidade 5%',
        );
        logger.info(
          `[Wallet] R$ ${cashback} de cashback creditado para cliente ${sale.customer_id}`,
        );
      }
    } catch (error) {
      logger.error('Error in sale.created listener:', error);
    }
  });

  logger.info('[NotificationListener] Engine de notificações do sistema iniciada.');
};
