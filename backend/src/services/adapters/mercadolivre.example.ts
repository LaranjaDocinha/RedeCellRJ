import axios from 'axios';

// Exemplo de implementação real
export class MercadoLivreRealAdapter {
  constructor(private config: any) {}

  async fetchOrders() {
    const response = await axios.get('https://api.mercadolibre.com/orders/search', {
      headers: { Authorization: `Bearer ${this.config.access_token}` },
      params: { seller: this.config.seller_id, 'order.status': 'paid' },
    });
    return response.data.results.map((order: any) => ({
      externalId: order.id,
      totalAmount: order.total_amount,
      // ... mapeamento completo
    }));
  }
}
