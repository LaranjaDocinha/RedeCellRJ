import { logger } from '../utils/logger.js';

export interface DeliveryQuote {
  provider: string;
  price: number;
  estimatedTime: string;
}

export const deliveryService = {
  async getQuote(originZip: string, destinationZip: string): Promise<DeliveryQuote[]> {
    // Mock de cálculo baseado em CEP
    logger.info(`[Delivery] Solicitando cotação de ${originZip} para ${destinationZip}`);

    return [
      { provider: 'Lalamove', price: 15.5, estimatedTime: '45 min' },
      { provider: 'Loggi', price: 18.9, estimatedTime: '30 min' },
      { provider: 'Mottu', price: 12.0, estimatedTime: '60 min' },
    ];
  },

  async requestDelivery(orderId: number, provider: string, _destinationZip: string) {
    logger.info(`[Delivery] Solicitando coleta via ${provider} para OS #${orderId}`);

    // Mock de resposta da API
    return {
      trackingId: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'BUSCANDO_MOTOBOY',
      trackingUrl: 'https://rastreamento.mock/uber-style',
    };
  },
};
