import { stockPredictionService } from '../services/stockPredictionService.js';

const NOTIFICATIONS_MICROSERVICE_URL =
  process.env.NOTIFICATIONS_MICROSERVICE_URL || 'http://localhost:3002';

export const stockPredictionJob = async () => {
  try {
    const lowStockAlerts = await stockPredictionService.predictStockNeeds();
    if (lowStockAlerts.length > 0) {
      console.warn('Low stock alerts generated:', lowStockAlerts);
      // Emitir notificação de estoque baixo via microservice
      await fetch(`${NOTIFICATIONS_MICROSERVICE_URL}/send/in-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Alerta de estoque baixo para ${lowStockAlerts.length} itens.`,
          type: 'low_stock_alert',
          details: lowStockAlerts,
        }),
      });
    } else {
      console.log('No low stock alerts generated.');
    }
  } catch (error) {
    console.error('Error in stock prediction job:', error);
  }
};
