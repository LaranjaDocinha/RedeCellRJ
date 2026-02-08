import { db, OfflineSale } from '../db';
import api from './api';

export const offlineSyncService = {
  /**
   * Inicializa o monitoramento de rede e sincronia automática.
   */
  init() {
    window.addEventListener('online', () => this.syncOfflineSales());
    // Tenta sincronizar no boot se estiver online
    if (navigator.onLine) {
      this.syncOfflineSales();
    }
  },

  async saveOfflineSale(saleData: any) {
    const offlineSale: OfflineSale = {
      ...saleData,
      timestamp: new Date(),
      synced: false
    };
    return await db.offlineSales.add(offlineSale);
  },

  async syncOfflineSales() {
    const unsynced = await db.offlineSales.where('synced').equals(0).toArray(); // Dexie usa 0/1 para boolean em filtros as vezes
    
    if (unsynced.length === 0) return;

    console.log(`[OfflineSync] Tentando sincronizar ${unsynced.length} vendas...`);

    for (const sale of unsynced) {
      try {
        await api.post('/api/v1/sales', sale);
        await db.offlineSales.update(sale.id!, { synced: true });
        console.log(`[OfflineSync] Venda #${sale.id} sincronizada.`);
      } catch (error) {
        console.error(`[OfflineSync] Falha ao sincronizar venda #${sale.id}`, error);
        // Mantém unsynced para tentar depois
      }
    }
  },

  async getOfflineProducts() {
      return await db.products.toArray();
  },

  async updateOfflineCatalog(products: any[]) {
      await db.products.clear();
      await db.products.bulkAdd(products);
  }
};