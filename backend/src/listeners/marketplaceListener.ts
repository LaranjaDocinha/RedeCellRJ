import appEvents from '../events/appEvents.js';
import { marketplaceSyncService } from '../services/marketplaceSyncService.js';
import { logger } from '../utils/logger.js';

export const initMarketplaceListener = () => {
  appEvents.on('sale.created', async ({ sale }) => {
    try {
      // Extrair itens vendidos e agrupar por variação
      // sale.items deve ter { variation_id, quantity }
      const soldItems = sale.items.map((item: any) => ({
        variation_id: item.variation_id,
        quantity: item.quantity,
      }));

      if (soldItems.length > 0) {
        logger.info(
          `[MarketplaceListener] Sale created. Triggering stock update for ${soldItems.length} variations.`,
        );
        await marketplaceSyncService.updateStockOnSale(soldItems);
      }
    } catch (error) {
      logger.error('[MarketplaceListener] Error updating marketplace stock:', error);
    }
  });
};
