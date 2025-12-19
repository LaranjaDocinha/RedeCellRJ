import { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { saleService } from './saleService.js';
import { customerService } from './customerService.js';
import axios from 'axios'; // Para futuras chamadas de API reais

// --- Interface para Adapters de Marketplace ---
interface IMarketplaceAdapter {
  id: number; // ID da config do marketplace
  name: string; // Nome do marketplace (ex: 'MercadoLivre')
  updateListingStock(listingExternalId: string, newQuantity: number): Promise<void>;
  fetchOrders(): Promise<any[]>; // Retorna pedidos no formato interno
  // Adicionar outros métodos conforme necessário (ex: createListing, updateListingPrice)
}

// --- Adapters Mock ---
class MercadoLivreAdapter implements IMarketplaceAdapter {
  constructor(public id: number, public name: string, private config: any) {}

  async updateListingStock(listingExternalId: string, newQuantity: number): Promise<void> {
    logger.info(`[ML Adapter ${this.id}] Updating stock for listing ${listingExternalId} to ${newQuantity}`);
    // Simular chamada de API do Mercado Livre
    // Ex: await axios.put(`https://api.mercadolibre.com/items/${listingExternalId}?access_token=${this.config.access_token}`, { available_quantity: newQuantity });
    await new Promise(resolve => setTimeout(resolve, 100));
    logger.info(`[ML Adapter ${this.id}] Stock updated for ${listingExternalId}`);
  }

  async fetchOrders(): Promise<any[]> {
    logger.info(`[ML Adapter ${this.id}] Fetching new orders...`);
    // Simular busca de pedidos
    await new Promise(resolve => setTimeout(resolve, 200));
    const orders = [
      // Mock de um pedido do ML
      {
        externalId: `ML-ORDER-${Date.now()}`,
        status: 'completed',
        customer: { name: 'Cliente ML', email: `cliente_ml_${Date.now()}@example.com`, phone: '11999999999' },
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
  constructor(public id: number, public name: string, private config: any) {}

  async updateListingStock(listingExternalId: string, newQuantity: number): Promise<void> {
    logger.info(`[Shopee Adapter ${this.id}] Updating stock for listing ${listingExternalId} to ${newQuantity}`);
    // Simular chamada de API da Shopee
    // Ex: await axios.post(`https://partner.shopeemobile.com/api/v2/product/update_stock?access_token=${this.config.access_token}&shop_id=${this.config.shop_id}`, { item_id: Number(listingExternalId), stock_list: [{ model_id: 0, normal_stock: newQuantity }] });
    await new Promise(resolve => setTimeout(resolve, 150));
    logger.info(`[Shopee Adapter ${this.id}] Stock updated for ${listingExternalId}`);
  }

  async fetchOrders(): Promise<any[]> {
    logger.info(`[Shopee Adapter ${this.id}] Fetching new orders...`);
    // Simular busca de pedidos
    await new Promise(resolve => setTimeout(resolve, 250));
    const orders = [
      // Mock de um pedido da Shopee
      {
        externalId: `SHOPEE-ORDER-${Date.now()}`,
        status: 'completed',
        customer: { name: 'Cliente Shopee', email: `cliente_shopee_${Date.now()}@example.com`, phone: '11888888888' },
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
  constructor(public id: number, public name: string) {}
  async updateListingStock(listingExternalId: string, newQuantity: number): Promise<void> {
    logger.warn(`[Default Adapter ${this.id}] No specific adapter for ${this.name}. Stock update for ${listingExternalId} to ${newQuantity} skipped.`);
  }
  async fetchOrders(): Promise<any[]> {
    logger.warn(`[Default Adapter ${this.id}] No specific adapter for ${this.name}. Fetching orders skipped.`);
    return [];
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

    const pool = getPool();
    const configRes = await pool.query(
      'SELECT id, name, api_key, api_secret, access_token, refresh_token FROM marketplace_configs WHERE id = $1 AND is_active = TRUE',
      [integrationId]
    );

    if (configRes.rows.length === 0) {
      throw new AppError(`Marketplace integration config ${integrationId} not found or inactive.`, 404);
    }
    const config = configRes.rows[0];

    let adapter: IMarketplaceAdapter;
    switch (config.name.toLowerCase()) {
      case 'mercadolivre':
        adapter = new MercadoLivreAdapter(config.id, config.name, config);
        break;
      case 'shopee':
        adapter = new ShopeeAdapter(config.id, config.name, config);
        break;
      default:
        adapter = new DefaultMarketplaceAdapter(config.id, config.name);
        break;
    }
    this.adapters.set(integrationId, adapter);
    return adapter;
  },

  /**
   * Atualiza o estoque nos marketplaces quando uma venda interna ou ajuste ocorre.
   * Recebe uma lista de itens que tiveram o estoque alterado (ou um item individual).
   */
  async updateStock(variationId: number, newQuantity: number): Promise<void> {
    logger.info(`[MarketplaceSync] Initiating stock update for variation ${variationId} to ${newQuantity}`);
    const pool = getPool();

    // Encontrar todos os listings ativos associados a esta variação de produto
    const listingsRes = await pool.query(
      'SELECT id, marketplace_id, external_id FROM marketplace_listings WHERE product_variation_id = $1 AND status = $2',
      [variationId, 'active']
    );

    for (const listing of listingsRes.rows) {
      try {
        const adapter = await this.getAdapter(listing.marketplace_id);
        await adapter.updateListingStock(listing.external_id, newQuantity);
        
        // Atualizar last_synced_at no listing e limpar erros
        await pool.query('UPDATE marketplace_listings SET last_synced_at = NOW(), sync_error = NULL WHERE id = $1', [listing.id]);
        logger.info(`[MarketplaceSync] Stock for listing ${listing.external_id} (${adapter.name}) updated successfully.`);
      } catch (error) {
        logger.error(`[MarketplaceSync] Failed to update stock for listing ${listing.external_id} on marketplace ${listing.marketplace_id}:`, error);
        // Registrar erro no marketplace_listings.sync_error
        await pool.query('UPDATE marketplace_listings SET sync_error = $1 WHERE id = $2', [(error as Error).message, listing.id]);
      }
    }
    logger.info(`[MarketplaceSync] Stock update routine finished for variation ${variationId}.`);
  },

  /**
   * Função chamada pelo saleService. Mantém compatibilidade.
   */
  async updateStockOnSale(soldItems: { variation_id: number; quantity: number }[]): Promise<void> {
    for (const item of soldItems) {
      // Para cada item vendido, busco o novo estoque total e chamo updateStock
      const pool = getPool();
      const currentStockRes = await pool.query(
        'SELECT stock_quantity FROM product_variations WHERE id = $1',
        [item.variation_id]
      );
      const currentStock = currentStockRes.rows[0]?.stock_quantity;
      if (currentStock !== undefined) {
        await this.updateStock(item.variation_id, currentStock);
      } else {
        logger.warn(`[MarketplaceSync] Current stock for variation ${item.variation_id} not found. Skipping marketplace update.`);
      }
    }
  },

  /**
   * Sincroniza pedidos de um marketplace específico.
   * Chamado por um Cron Job ou manualmente.
   */
  async syncMarketplaceOrders(integrationId: number): Promise<void> {
    logger.info(`[MarketplaceSync] Syncing orders for integration ${integrationId}...`);
    const pool = getPool();

    try {
      const adapter = await this.getAdapter(integrationId);
      const externalOrders = await adapter.fetchOrders();

      for (const externalOrder of externalOrders) {
        // Verificar se o pedido já existe para evitar duplicidade
        const existingOrderRes = await pool.query(
          'SELECT id FROM sales WHERE external_order_id = $1 AND marketplace_integration_id = $2',
          [externalOrder.externalId, integrationId]
        );

        if (existingOrderRes.rows.length > 0) {
          logger.info(`[MarketplaceSync] Order ${externalOrder.externalId} already exists. Skipping.`);
          continue;
        }

        // 1. Encontrar ou criar cliente
        let customerId: number;
        let customer = await customerService.getCustomerByEmail(externalOrder.customer.email);
        if (customer) {
          customerId = customer.id;
        } else {
          // Criar novo cliente se não existir
          const newCustomerRes = await pool.query(
            'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
            [externalOrder.customer.name, externalOrder.customer.email, externalOrder.customer.phone]
          );
          customerId = newCustomerRes.rows[0].id;
        }

        // 2. Mapear itens para product_variations internos
        const mappedItems = [];
        for (const extItem of externalOrder.items) {
          const listingRes = await pool.query(
            'SELECT product_variation_id FROM marketplace_listings WHERE marketplace_id = $1 AND external_id = $2',
            [integrationId, extItem.externalProductId]
          );
          if (listingRes.rows.length === 0) {
            logger.warn(`[MarketplaceSync] Listing for external product ${extItem.externalProductId} on integration ${integrationId} not found. Skipping order item.`);
            continue;
          }
          const product_variation_id = listingRes.rows[0].product_variation_id;
          
          // Buscar informações do produto/variação interno
          const pvRes = await pool.query('SELECT product_id, price, cost_price FROM product_variations WHERE id = $1', [product_variation_id]);
          const pv = pvRes.rows[0];

          if (!pv) {
            logger.error(`[MarketplaceSync] Product variation ${product_variation_id} not found internally. Skipping order item.`);
            continue;
          }

          mappedItems.push({
            product_id: pv.product_id,
            variation_id: product_variation_id,
            quantity: extItem.quantity,
            unit_price: extItem.unitPrice || pv.price, // Usar preço do marketplace ou o nosso
            cost_price: pv.cost_price,
          });
        }

        if (mappedItems.length === 0) {
          logger.warn(`[MarketplaceSync] No valid items for external order ${externalOrder.externalId}. Skipping sale creation.`);
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

        logger.info(`[MarketplaceSync] Created internal sale for external order ${externalOrder.externalId}`);
      }
    } catch (error) {
      logger.error(`[MarketplaceSync] Error syncing orders for integration ${integrationId}:`, error);
    }
    logger.info(`[MarketplaceSync] Order sync finished for integration ${integrationId}.`);
  },

  // Métodos para gerenciamento de configurações e listings (futuros controllers/services)
  async getIntegrationConfigs() {
    const pool = getPool();
    const res = await pool.query('SELECT id, name, is_active FROM marketplace_configs');
    return res.rows;
  },

  async createIntegration(name: string, { apiKey, apiSecret, accessToken, refreshToken, tokenExpiresAt, isActive }: any) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO marketplace_configs (name, api_key, api_secret, access_token, refresh_token, token_expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, apiKey, apiSecret, accessToken, refreshToken, tokenExpiresAt, isActive]
    );
    return res.rows[0];
  },

  async updateIntegration(id: number, { name, apiKey, apiSecret, accessToken, refreshToken, tokenExpiresAt, isActive }: any) {
    const pool = getPool();
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (name !== undefined) { fields.push(`name = ${queryIndex++}`); values.push(name); }
    if (apiKey !== undefined) { fields.push(`api_key = ${queryIndex++}`); values.push(apiKey); }
    if (apiSecret !== undefined) { fields.push(`api_secret = ${queryIndex++}`); values.push(apiSecret); }
    if (accessToken !== undefined) { fields.push(`access_token = ${queryIndex++}`); values.push(accessToken); }
    if (refreshToken !== undefined) { fields.push(`refresh_token = ${queryIndex++}`); values.push(refreshToken); }
    if (tokenExpiresAt !== undefined) { fields.push(`token_expires_at = ${queryIndex++}`); values.push(tokenExpiresAt); }
    if (isActive !== undefined) { fields.push(`is_active = ${queryIndex++}`); values.push(isActive); }
    
    if (fields.length === 0) {
      const current = await pool.query('SELECT * FROM marketplace_configs WHERE id = $1', [id]);
      if (current.rows.length === 0) throw new AppError('Integration not found', 404);
      return current.rows[0];
    }

    values.push(id);
    const res = await pool.query(
      `UPDATE marketplace_configs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ${queryIndex} RETURNING *`,
      values
    );
    if (res.rows.length === 0) throw new AppError('Integration not found', 404);
    return res.rows[0];
  },

  async deleteIntegration(id: number) {
    const pool = getPool();
    const res = await pool.query('DELETE FROM marketplace_configs WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new AppError('Integration not found', 404);
    return { success: true };
  },

  async getListings(integrationId?: number) {
    const pool = getPool();
    let query = 'SELECT ml.*, mc.name as marketplace_name, pv.sku, p.name as product_name FROM marketplace_listings ml JOIN marketplace_configs mc ON ml.marketplace_id = mc.id JOIN product_variations pv ON ml.product_variation_id = pv.id JOIN products p ON pv.product_id = p.id';
    const params = [];
    if (integrationId) {
      query += ' WHERE ml.marketplace_id = $1';
      params.push(integrationId);
    }
    const res = await pool.query(query, params);
    return res.rows;
  },

  async createListing(marketplaceId: number, productVariationId: number, externalId: string, externalUrl?: string) {
    const pool = getPool();
    try {
      const res = await pool.query(
        'INSERT INTO marketplace_listings (marketplace_id, product_variation_id, external_id, external_url, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (marketplace_id, external_id) DO UPDATE SET product_variation_id = EXCLUDED.product_variation_id, external_url = EXCLUDED.external_url, status = EXCLUDED.status RETURNING *',
        [marketplaceId, productVariationId, externalId, externalUrl, 'active']
      );
      return res.rows[0];
    } catch (error) {
      if ((error as any).code === '23503') { // Foreign key violation
        throw new AppError('Invalid marketplace ID or product variation ID', 400);
      } else if ((error as any).code === '23505') { // Unique violation for (marketplace_id, external_id)
        throw new AppError('Listing with this external ID already exists for this marketplace', 409);
      }
      throw error;
    }
  },

  async updateListing(id: number, { marketplaceId, productVariationId, externalId, externalUrl, status }: any) {
    const pool = getPool();
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (marketplaceId !== undefined) { fields.push(`marketplace_id = ${queryIndex++}`); values.push(marketplaceId); }
    if (productVariationId !== undefined) { fields.push(`product_variation_id = ${queryIndex++}`); values.push(productVariationId); }
    if (externalId !== undefined) { fields.push(`external_id = ${queryIndex++}`); values.push(externalId); }
    if (externalUrl !== undefined) { fields.push(`external_url = ${queryIndex++}`); values.push(externalUrl); }
    if (status !== undefined) { fields.push(`status = ${queryIndex++}`); values.push(status); }

    if (fields.length === 0) {
      const current = await pool.query('SELECT * FROM marketplace_listings WHERE id = $1', [id]);
      if (current.rows.length === 0) throw new AppError('Listing not found', 404);
      return current.rows[0];
    }

    values.push(id);
    const res = await pool.query(
      `UPDATE marketplace_listings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ${queryIndex} RETURNING *`,
      values
    );
    if (res.rows.length === 0) throw new AppError('Listing not found', 404);
    return res.rows[0];
  },

  async deleteListing(id: number) {
    const pool = getPool();
    const res = await pool.query('DELETE FROM marketplace_listings WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new AppError('Listing not found', 404);
    return { success: true };
  }
};
