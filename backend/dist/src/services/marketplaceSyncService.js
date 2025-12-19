import { getPool } from '../db/index.js';
import axios from 'axios';
import { saleService } from './saleService.js'; // Import saleService
import { customerService } from './customerService.js'; // Import customerService
import { logger } from '../utils/logger.js';
// Helper to get integration credentials
const getIntegration = async (integrationId) => {
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM marketplace_integrations WHERE id = $1 AND is_active = TRUE', [platform]);
    return rows[0];
};
// Sync stock for a specific variation across all linked marketplaces
export const syncStockToMarketplace = async (productVariationId) => {
    const pool = getPool();
    // 1. Get current stock
    const stockRes = await pool.query('SELECT quantity FROM product_stock WHERE product_variant_id = $1', // Sum all branches? or specific? Assuming sum for online sales
    [productVariationId]);
    const totalStock = stockRes.rows.reduce((acc, row) => acc + row.quantity, 0);
    // 2. Get external listings
    const listingsRes = await pool.query('SELECT el.*, mi.platform, mi.access_token, mi.shop_id FROM external_listings el JOIN marketplace_integrations mi ON el.integration_id = mi.id WHERE el.product_variation_id = $1 AND mi.is_active = TRUE', [productVariationId]);
    for (const listing of listingsRes.rows) {
        try {
            if (listing.platform === 'shopee') {
                // Shopee API Update Stock
                await axios.post(`https://partner.shopeemobile.com/api/v2/product/update_stock?access_token=${listing.access_token}&shop_id=${listing.shop_id}`, {
                    item_id: Number(listing.external_id),
                    stock_list: [{ model_id: 0, normal_stock: totalStock }] // Simplified
                });
            }
            else if (listing.platform === 'mercadolivre') {
                // ML API Update Stock
                await axios.put(`https://api.mercadolibre.com/items/${listing.external_id}?access_token=${listing.access_token}`, {
                    available_quantity: totalStock
                });
            }
            // Log success
            await pool.query('UPDATE external_listings SET last_synced_at = NOW(), status = $1 WHERE id = $2', ['synced', listing.id]);
            logger.info(`Synced stock for variation ${productVariationId} to ${listing.platform}`);
        }
        catch (error) {
            logger.error(`Failed to sync to ${listing.platform}:`, error.message);
            // Log error status
            await pool.query('UPDATE external_listings SET status = $1 WHERE id = $2', ['error', listing.id]);
        }
    }
};
export const updateStockOnSale = async (items) => {
    // items: [{ variation_id, quantity }]
    for (const item of items) {
        await syncStockToMarketplace(item.variation_id);
    }
};
export const syncOrdersFromMarketplace = async (integrationId) => {
    const pool = getPool();
    const integration = await getIntegration(integrationId);
    if (!integration) {
        logger.warn(`Marketplace integration ${integrationId} not found or inactive.`);
        return { success: false, message: 'Integration not found or inactive.' };
    }
    logger.info(`Fetching orders from ${integration.platform} (Integration ID: ${integrationId})...`);
    // --- Mocking Marketplace API Calls ---
    let externalOrders = [];
    if (integration.platform === 'shopee') {
        // Mock Shopee API call
        externalOrders = [{
                external_order_id: `SHP-${Date.now()}-1`,
                customer_email: `customer_${Date.now()}@shopee.com`,
                total_amount: 150.00,
                items: [{ external_item_id: 'PRD-SHP-123', quantity: 1, unit_price: 150.00 }],
                payment_method: 'shopee_pay',
                status: 'PAID'
            }];
    }
    else if (integration.platform === 'mercadolivre') {
        // Mock Mercado Livre API call
        externalOrders = [{
                external_order_id: `ML-${Date.now()}-1`,
                customer_email: `customer_${Date.now()}@mercadolivre.com`,
                total_amount: 200.00,
                items: [{ external_item_id: 'PRD-ML-456', quantity: 1, unit_price: 200.00 }],
                payment_method: 'mercado_pago',
                status: 'paid'
            }];
    }
    // --- End Mocking ---
    for (const externalOrder of externalOrders) {
        // Check if order already imported
        const existingSale = await pool.query('SELECT id FROM sales WHERE external_order_id = $1', [externalOrder.external_order_id]);
        if (existingSale.rows.length > 0) {
            logger.info(`Order ${externalOrder.external_order_id} already imported.`);
            continue;
        }
        try {
            // Find or create customer
            let customer = await customerService.getCustomerByEmail(externalOrder.customer_email);
            if (!customer) {
                customer = await customerService.createCustomer({
                    name: `Marketplace Customer (${externalOrder.customer_email})`,
                    email: externalOrder.customer_email,
                });
            }
            // Map external items to internal product variations
            const saleItems = await Promise.all(externalOrder.items.map(async (item) => {
                // Find internal product variation by external_item_id (requires mapping table or search)
                // For now, let's mock finding a variation
                const productVariation = { id: 1, product_id: 1, price: item.unit_price, cost_price: item.unit_price * 0.7 }; // Mock
                return {
                    product_id: productVariation.product_id,
                    variation_id: productVariation.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    cost_price: productVariation.cost_price,
                    total_price: item.quantity * item.unit_price,
                };
            }));
            // Create sale
            await saleService.createSale({
                customerId: customer.id,
                items: saleItems,
                payments: [{ method: externalOrder.payment_method, amount: externalOrder.total_amount }],
                userId: 'system_marketplace', // Or a dedicated system user
                branchId: 1, // Default branch for online orders
                externalOrderId: externalOrder.external_order_id,
                marketplaceIntegrationId: integrationId,
            });
            logger.info(`Imported order ${externalOrder.external_order_id} from ${integration.platform}`);
            await pool.query('UPDATE marketplace_integrations SET last_synced_at = NOW() WHERE id = $1', [integrationId]);
        }
        catch (error) {
            logger.error(`Error importing order ${externalOrder.external_order_id}:`, error);
        }
    }
    return { success: true, message: `Orders fetched from ${integration.platform} and processed.` };
};
// Placeholder exports to keep compatibility if needed
export const syncProductsToMarketplace = async (productsData, marketplace) => {
    logger.info(`Simulating product synchronization to ${marketplace} marketplace:`, productsData);
    return { success: true, message: `Product data sent to ${marketplace} (simulated).` };
};
export const syncOrdersFromMarketplaceOLD = async (marketplace) => {
    logger.info(`Simulating fetching orders from ${marketplace} marketplace.`);
    return { success: true, message: `Orders fetched from ${marketplace} (simulated).` };
};
export const getMarketplaceSyncStatus = async (marketplace) => {
    return {
        status: 'Connected',
        lastSync: new Date().toISOString(),
        marketplace: `${marketplace} (Simulated)`,
    };
};
