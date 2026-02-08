import pool from '../db/index.js'; // Keep pool for transactions in syncMarketplaceOrders if needed, or refactor to use service layer calls
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { saleService } from './saleService.js';
import { customerService } from './customerService.js';
import { marketplaceRepository } from '../repositories/marketplace.repository.js';
import { createCircuitBreaker } from '../utils/circuitBreaker.js';

interface IMarketplaceAdapter {
  id: number;
  name: string;
  updateListingStock(listingExternalId: string, newQuantity: number): Promise<void>;
  fetchOrders(): Promise<any[]>;
}

class MercadoLivreAdapter implements IMarketplaceAdapter {
  constructor(
    public id: number,
    public name: string,
    private config: any,
  ) {}

  async updateListingStock(listingExternalId: string, newQuantity: number): Promise<void> {
    logger.info(
      `[ML Adapter ${this.id}] Updating stock for listing ${listingExternalId} to ${newQuantity}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    logger.info(`[ML Adapter ${this.id}] Stock updated for ${listingExternalId}`);
  }

  async fetchOrders(): Promise<any[]> {
    logger.info(`[ML Adapter ${this.id}] Fetching new orders...`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const orders = [
      {
        externalId: `ML-ORDER-${Date.now()}`,
        status: 'completed',
        customer: {
          name: 'Cliente ML',
          email: `cliente_ml_${Date.now()}@example.com`,
          phone: '11999999999',
        },
        items: [{ externalProductId: 'ML-SKU-123', quantity: 1, unitPrice: 100 }],
        totalAmount: 100,
        marketplaceIntegrationId: this.id,
      },
    ];
    logger.info(`[ML Adapter ${this.id}] Found ${orders.length} orders.`);
    return orders;
  }
}

class ShopeeAdapter implements IMarketplaceAdapter {
  constructor(
    public id: number,
    public name: string,
    private config: any,
  ) {}

  async updateListingStock(listingExternalId: string, newQuantity: number): Promise<void> {
    logger.info(
      `[Shopee Adapter ${this.id}] Updating stock for listing ${listingExternalId} to ${newQuantity}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 150));
    logger.info(`[Shopee Adapter ${this.id}] Stock updated for ${listingExternalId}`);
  }

  async fetchOrders(): Promise<any[]> {
    logger.info(`[Shopee Adapter ${this.id}] Fetching new orders...`);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const orders = [
      {
        externalId: `SHOPEE-ORDER-${Date.now()}`,
        status: 'completed',
        customer: {
          name: 'Cliente Shopee',
          email: `cliente_shopee_${Date.now()}@example.com`,
          phone: '11888888888',
        },
        items: [{ externalProductId: 'SHOPEE-SKU-456', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
        marketplaceIntegrationId: this.id,
      },
    ];
    logger.info(`[Shopee Adapter ${this.id}] Found ${orders.length} orders.`);
    return orders;
  }
}

class DefaultMarketplaceAdapter implements IMarketplaceAdapter {
  constructor(
    public id: number,
    public name: string,
  ) {}
  async updateListingStock(listingExternalId: string, newQuantity: number): Promise<void> {
    logger.warn(
      `[Default Adapter ${this.id}] No specific adapter for ${this.name}. Stock update for ${listingExternalId} to ${newQuantity} skipped.`,
    );
  }
  async fetchOrders(): Promise<any[]> {
    logger.warn(
      `[Default Adapter ${this.id}] No specific adapter for ${this.name}. Fetching orders skipped.`,
    );
    return [];
  }
}

// Wrapper class to add Circuit Breaker logic to any adapter
class ResilientAdapter implements IMarketplaceAdapter {
  private stockBreaker: any;
  private ordersBreaker: any;

  constructor(private adapter: IMarketplaceAdapter) {
    this.stockBreaker = createCircuitBreaker(adapter.updateListingStock.bind(adapter));
    this.stockBreaker.fallback(() =>
      logger.warn(`[CircuitBreaker] Stock update skipped for ${adapter.name} due to open circuit.`),
    );

    this.ordersBreaker = createCircuitBreaker(adapter.fetchOrders.bind(adapter));
    this.ordersBreaker.fallback(() => {
      logger.warn(`[CircuitBreaker] Fetch orders skipped for ${adapter.name} due to open circuit.`);
      return [];
    });
  }

  get id() {
    return this.adapter.id;
  }
  get name() {
    return this.adapter.name;
  }

  async updateListingStock(listingExternalId: string, newQuantity: number): Promise<void> {
    return this.stockBreaker.fire(listingExternalId, newQuantity);
  }

  async fetchOrders(): Promise<any[]> {
    return this.ordersBreaker.fire();
  }
}

export const marketplaceSyncService = {
  // Mapa de adapters instanciados para reutilização
  adapters: new Map<number, IMarketplaceAdapter>(),

  // Método para obter um adapter de marketplace
  async getAdapter(integrationId: number): Promise<IMarketplaceAdapter> {
    if (this.adapters.has(integrationId)) {
      return this.adapters.get(integrationId)!;
    }

    const config = await marketplaceRepository.findActiveConfig(integrationId);

    if (!config) {
      throw new AppError(
        `Marketplace integration config ${integrationId} not found or inactive.`,
        404,
      );
    }

    let rawAdapter: IMarketplaceAdapter;
    switch (config.name.toLowerCase()) {
      case 'mercadolivre':
        rawAdapter = new MercadoLivreAdapter(config.id, config.name, config);
        break;
      case 'shopee':
        rawAdapter = new ShopeeAdapter(config.id, config.name, config);
        break;
      default:
        rawAdapter = new DefaultMarketplaceAdapter(config.id, config.name);
        break;
    }

    // Wrap with Circuit Breaker
    const resilientAdapter = new ResilientAdapter(rawAdapter);

    this.adapters.set(integrationId, resilientAdapter);
    return resilientAdapter;
  },

  /**
   * Atualiza o estoque nos marketplaces quando uma venda interna ou ajuste ocorre.
   * Recebe uma lista de itens que tiveram o estoque alterado (ou um item individual).
   */
  async updateStock(variationId: number, newQuantity: number): Promise<void> {
    logger.info(
      `[MarketplaceSync] Initiating stock update for variation ${variationId} to ${newQuantity}`,
    );

    const listings = await marketplaceRepository.findListingsByVariation(variationId);

    for (const listing of listings) {
      try {
        const adapter = await this.getAdapter(listing.marketplace_id);
        await adapter.updateListingStock(listing.external_id, newQuantity);

        await marketplaceRepository.updateListingSyncStatus(listing.id);
        logger.info(
          `[MarketplaceSync] Stock for listing ${listing.external_id} (${adapter.name}) updated successfully.`,
        );
      } catch (error) {
        logger.error(
          `[MarketplaceSync] Failed to update stock for listing ${listing.external_id} on marketplace ${listing.marketplace_id}:`,
          error,
        );
        await marketplaceRepository.updateListingSyncStatus(listing.id, (error as Error).message);
      }
    }
    logger.info(`[MarketplaceSync] Stock update routine finished for variation ${variationId}.`);
  },

  /**
   * Função chamada pelo saleService. Mantém compatibilidade.
   */
  async updateStockOnSale(
    soldItems: { variation_id: number; quantity: number }[],
    branchId: number,
  ): Promise<void> {
    for (const item of soldItems) {
      // Use direct query to get stock or inject InventoryRepo? Direct query is fine for simple check if we don't have repo handy
      // But we should use repo. Let's use pool for now as it was or fetch via inventoryRepo if available.
      // Since inventoryRepo is not imported, let's keep pool query but this is a tech debt.
      const currentStockRes = await pool.query(
        'SELECT stock_quantity FROM branch_product_variations_stock WHERE product_variation_id = $1 AND branch_id = $2',
        [item.variation_id, branchId],
      );
      const currentStock = currentStockRes.rows[0]?.stock_quantity;
      if (currentStock !== undefined) {
        await this.updateStock(item.variation_id, currentStock);
      } else {
        logger.warn(
          `[MarketplaceSync] Current stock for variation ${item.variation_id} in branch ${branchId} not found. Skipping marketplace update.`,
        );
      }
    }
  },

  /**
   * Sincroniza pedidos de um marketplace específico.
   * Chamado por um Cron Job ou manualmente.
   */
  async syncMarketplaceOrders(integrationId: number): Promise<void> {
    logger.info(`[MarketplaceSync] Syncing orders for integration ${integrationId}...`);

    try {
      const adapter = await this.getAdapter(integrationId);
      const externalOrders = await adapter.fetchOrders();

      for (const externalOrder of externalOrders) {
        // Verificar se o pedido já existe para evitar duplicidade
        const existingOrderRes = await pool.query(
          'SELECT id FROM sales WHERE external_order_id = $1 AND marketplace_integration_id = $2',
          [externalOrder.externalId, integrationId],
        );

        if (existingOrderRes.rows.length > 0) {
          logger.info(
            `[MarketplaceSync] Order ${externalOrder.externalId} already exists. Skipping.`,
          );
          continue;
        }

        // 1. Encontrar ou criar cliente
        let customerId: number;
        const customer = await customerService.getCustomerByEmail(externalOrder.customer.email);
        if (customer) {
          customerId = customer.id;
        } else {
          // Criar novo cliente
          // Use customerService instead of direct query
          const newCustomer = await customerService.createCustomer({
            name: externalOrder.customer.name,
            email: externalOrder.customer.email,
            phone: externalOrder.customer.phone,
          });
          customerId = newCustomer.id;
        }

        // 2. Mapear itens para product_variations internos
        const mappedItems = [];
        for (const extItem of externalOrder.items) {
          const listing = await marketplaceRepository.findListingByExternalId(
            integrationId,
            extItem.externalProductId,
          );
          if (!listing) {
            logger.warn(
              `[MarketplaceSync] Listing for external product ${extItem.externalProductId} on integration ${integrationId} not found. Skipping order item.`,
            );
            continue;
          }

          // Buscar produto interno
          const pvRes = await pool.query(
            'SELECT product_id, price, cost_price FROM product_variations WHERE id = $1',
            [listing.product_variation_id],
          );
          const pv = pvRes.rows[0];

          if (!pv) {
            logger.error(
              `[MarketplaceSync] Product variation ${listing.product_variation_id} not found internally. Skipping order item.`,
            );
            continue;
          }

          mappedItems.push({
            product_id: pv.product_id,
            variation_id: listing.product_variation_id,
            quantity: extItem.quantity,
            unit_price: extItem.unitPrice || pv.price, // Usar preço do marketplace ou o nosso
            cost_price: pv.cost_price,
          });
        }

        if (mappedItems.length === 0) {
          logger.warn(
            `[MarketplaceSync] No valid items for external order ${externalOrder.externalId}. Skipping sale creation.`,
          );
          continue;
        }

        // 3. Criar a venda no sistema interno
        // TODO: Ajustar para pegar userId (ex: um usuário "sistema" ou da integração)
        const systemUserId = 'd2e2b3e8-a7f4-4e4b-b0e7-8c3c3c3c3c3c'; // ID de um usuário de sistema mock ou o admin (do seed)
        const branchId = 1; // Branch padrão

        await saleService.createSale({
          customerId: String(customerId),
          items: mappedItems,
          payments: [{ method: 'marketplace', amount: externalOrder.totalAmount }],
          userId: systemUserId,
          branchId: branchId,
          externalOrderId: externalOrder.externalId,
          marketplaceIntegrationId: integrationId,
        });

        logger.info(
          `[MarketplaceSync] Created internal sale for external order ${externalOrder.externalId}`,
        );
      }
    } catch (error) {
      logger.error(
        `[MarketplaceSync] Error syncing orders for integration ${integrationId}:`,
        error,
      );
    }
    logger.info(`[MarketplaceSync] Order sync finished for integration ${integrationId}.`);
  },

  // Métodos para gerenciamento de configurações e listings (futuros controllers/services)
  async getIntegrationConfigs() {
    return marketplaceRepository.findAllConfigs();
  },

  async createIntegration(name: string, data: any) {
    return marketplaceRepository.createConfig({ name, ...data });
  },

  async updateIntegration(id: number, data: any) {
    const updated = await marketplaceRepository.updateConfig(id, data);
    if (!updated) throw new AppError('Integration not found', 404);
    return updated;
  },

  async deleteIntegration(id: number) {
    const deleted = await marketplaceRepository.deleteConfig(id);
    if (!deleted) throw new AppError('Integration not found', 404);
    return { success: true };
  },

  async getListings(integrationId?: number) {
    if (integrationId) {
      return marketplaceRepository.findListingsByConfig(integrationId);
    }
    // Generic findAll listings logic if needed or empty
    return [];
  },

  async createListing(
    marketplaceId: number,
    productVariationId: number,
    externalId: string,
    externalUrl?: string,
  ) {
    try {
      return await marketplaceRepository.createListing({
        marketplace_id: marketplaceId,
        product_variation_id: productVariationId,
        external_id: externalId,
        external_url: externalUrl,
      });
    } catch (error) {
      if ((error as any).code === '23503') {
        throw new AppError('Invalid marketplace ID or product variation ID', 400);
      } else if ((error as any).code === '23505') {
        throw new AppError(
          'Listing with this external ID already exists for this marketplace',
          409,
        );
      }
      throw error;
    }
  },

  async updateListing(_id: number, _data: any) {
    // Repo doesn't support generic updateListing with fields array logic easily without refactoring repo to accept partial object.
    // Assuming repo updateListingStatus handles status, but for others we might need a richer repo method.
    // For now, let's throw unimplemented or basic support.
    throw new AppError('Full listing update not implemented in repo yet', 501);
  },

  async deleteListing(id: number) {
    const deleted = await marketplaceRepository.deleteListing(id);
    if (!deleted) throw new AppError('Listing not found', 404);
    return { success: true };
  },
};
