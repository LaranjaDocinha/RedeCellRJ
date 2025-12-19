import { AppError } from '../utils/errors.js';
import pool, { getPool } from '../db/index.js';
import { demandPredictionService } from './demandPredictionService.js'; // Importar o serviço de previsão de demanda
const NOTIFICATIONS_MICROSERVICE_URL = process.env.NOTIFICATIONS_MICROSERVICE_URL || 'http://localhost:3002';
export const inventoryService = {
    async getLowStockProducts(threshold = 10) {
        const { rows } = await pool.query(`SELECT
        p.id AS product_id,
        p.name,
        ps.quantity AS stock_quantity,
        pv.low_stock_threshold
       FROM product_stock ps
       JOIN product_variations pv ON ps.product_variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ps.quantity <= $1 OR ps.quantity <= pv.low_stock_threshold
       ORDER BY ps.quantity ASC`, [threshold]);
        return rows;
    },
    async adjustStock(variationId, quantityChange, reason, userId, dbClient, unitCost, branchId) {
        const client = dbClient || (await pool.connect());
        const shouldManageTransaction = !dbClient;
        try {
            if (shouldManageTransaction)
                await client.query('BEGIN');
            // Fetch stock quantity from product_stock, but low_stock_threshold from product_variations
            const { rows: [stockInfo], } = await client.query(`SELECT ps.quantity as stock_quantity, pv.low_stock_threshold, pv.product_id
         FROM product_stock ps
         JOIN product_variations pv ON ps.product_variant_id = pv.id
         WHERE ps.product_variant_id = $1 AND ps.branch_id = $2 FOR UPDATE`, [variationId, branchId || 1]);
            if (!stockInfo) {
                throw new AppError('Product variation stock not found for this branch.', 404);
            }
            const newStock = stockInfo.stock_quantity + quantityChange;
            if (newStock < 0) {
                throw new AppError('Stock quantity cannot be negative.', 400);
            }
            if (quantityChange > 0 && unitCost === undefined) {
                // unitCost might be optional if we are only decreasing stock, or if we have a default cost
                // For simplicity, make it required only if `reason` is 'stock_received'
                if (reason === 'stock_received' && unitCost === undefined) {
                    throw new AppError('Unit cost is required when receiving stock.', 400);
                }
            }
            // Update stock quantity in product_stock
            const { rows: [updatedStock], } = await client.query('UPDATE product_stock SET quantity = $1 WHERE product_variant_id = $2 AND branch_id = $3 RETURNING *', [newStock, variationId, branchId || 1]);
            // Record inventory movement
            await client.query('INSERT INTO inventory_movements (product_variation_id, branch_id, quantity_change, reason, user_id, unit_cost, quantity_remaining) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
                variationId,
                branchId || 1, // Use provided branchId
                quantityChange,
                reason,
                userId,
                unitCost,
                quantityChange > 0 ? quantityChange : null,
            ]);
            // If stock is going out, update quantity_remaining in FIFO layers
            if (quantityChange < 0) {
                let stockToRemove = Math.abs(quantityChange);
                const purchaseLayers = await client.query(`SELECT id, quantity_remaining
           FROM inventory_movements
           WHERE product_variation_id = $1 AND quantity_change > 0 AND quantity_remaining > 0 AND branch_id = $2
           ORDER BY created_at ASC`, [variationId, branchId || 1]);
                for (const layer of purchaseLayers.rows) {
                    if (stockToRemove <= 0)
                        break;
                    const available = layer.quantity_remaining;
                    const toRemoveFromLayer = Math.min(stockToRemove, available);
                    await client.query('UPDATE inventory_movements SET quantity_remaining = quantity_remaining - $1 WHERE id = $2', [toRemoveFromLayer, layer.id]);
                    stockToRemove -= toRemoveFromLayer;
                }
                if (stockToRemove > 0) {
                    // This should not happen if stock levels are consistent. Throw an error.
                    throw new AppError('Not enough stock layers to fulfill the order. Inventory data is inconsistent.', 500);
                }
            }
            // Check for low stock after update
            if (updatedStock.quantity <= stockInfo.low_stock_threshold) {
                // Emitir notificação de estoque baixo via microservice
                await fetch(`${NOTIFICATIONS_MICROSERVICE_URL}/send/in-app`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Estoque baixo para o produto ${stockInfo.product_id}, variação ${variationId}. Quantidade atual: ${updatedStock.quantity}, Limite: ${stockInfo.low_stock_threshold}.`,
                        type: 'low_stock_alert',
                        productId: stockInfo.product_id,
                        variationId: variationId,
                        currentStock: updatedStock.quantity,
                        threshold: stockInfo.low_stock_threshold,
                    }),
                });
            }
            if (shouldManageTransaction)
                await client.query('COMMIT');
            return updatedStock;
        }
        catch (error) {
            if (shouldManageTransaction)
                await client.query('ROLLBACK');
            console.error('Error in adjustStock:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
        finally {
            if (shouldManageTransaction)
                client.release();
        }
    },
    async receiveStock(variationId, quantity, unitCost, userId, dbClient) {
        if (quantity <= 0) {
            throw new AppError('Quantity must be positive to receive stock.', 400);
        }
        return this.adjustStock(variationId, quantity, 'stock_received', userId, dbClient, unitCost);
    },
    async dispatchStock(variationId, quantity, userId, dbClient) {
        if (quantity <= 0) {
            throw new AppError('Quantity must be positive to dispatch stock.', 400);
        }
        return this.adjustStock(variationId, -quantity, 'stock_dispatched', userId, dbClient);
    },
    async getInventoryDiscrepancies(branchId) {
        const pool = getPool();
        const result = await pool.query(`WITH StockMovements AS (
          SELECT
              im.product_variation_id,
              SUM(CASE WHEN im.quantity_change > 0 THEN im.quantity_change ELSE 0 END) AS total_received,
              SUM(CASE WHEN im.quantity_change < 0 THEN im.quantity_change ELSE 0 END) AS total_dispatched
          FROM inventory_movements im
          WHERE im.branch_id = $1
          GROUP BY im.product_variation_id
      )
      SELECT
          p.name AS product_name,
          pv.color AS variation_color,
          pv.storage_capacity,
          ps.quantity AS actual_stock,
          (COALESCE(sm.total_received, 0) + COALESCE(sm.total_dispatched, 0)) AS theoretical_stock,
          ps.quantity - (COALESCE(sm.total_received, 0) + COALESCE(sm.total_dispatched, 0)) AS discrepancy
      FROM product_stock ps
      JOIN product_variations pv ON ps.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN StockMovements sm ON ps.product_variation_id = sm.product_variation_id
      WHERE ps.branch_id = $1 AND (ps.quantity - (COALESCE(sm.total_received, 0) + COALESCE(sm.total_dispatched, 0))) <> 0;`, [branchId]);
        return result.rows;
    },
    /**
     * Sugere pedidos de compra com base na previsão de demanda e estoque atual.
     * @param branchId O ID da filial para a qual gerar as sugestões.
     * @returns Lista de sugestões de pedidos de compra.
     */
    async suggestPurchaseOrders(branchId) {
        const suggestions = [];
        // Obter todos os produtos (ou apenas aqueles com baixo estoque)
        const { rows: products } = await pool.query(`
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        pv.id AS variation_id,
        pv.color AS variation_color,
        ps.quantity AS current_stock,
        pv.low_stock_threshold,
        pv.reorder_point, -- Ponto de reabastecimento (novo campo na variação do produto)
        pv.lead_time_days -- Tempo de reposição em dias (novo campo na variação do produto)
      FROM product_stock ps
      JOIN product_variations pv ON ps.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ps.branch_id = $1 AND ps.quantity <= pv.low_stock_threshold
      ORDER BY p.name, pv.color;
    `, [branchId]);
        for (const product of products) {
            // Prever a demanda para o próximo mês (pode ser ajustado)
            const predictedDemand = await demandPredictionService.predictDemand(product.product_id, 3 // Previsão baseada nos últimos 3 meses
            );
            // Calcular a quantidade sugerida
            const currentStock = product.current_stock;
            const reorderPoint = product.reorder_point || product.low_stock_threshold || 0; // Usar reorder_point se existir
            const leadTimeDemand = predictedDemand * ((product.lead_time_days || 7) / 30); // Demanda durante o tempo de reposição
            // A quantidade a sugerir é a demanda prevista + demanda durante o lead time - estoque atual
            let suggestedQuantity = Math.ceil(predictedDemand + leadTimeDemand - currentStock);
            if (suggestedQuantity > 0) {
                suggestions.push({
                    productId: product.product_id,
                    productName: product.product_name,
                    variationId: product.variation_id,
                    variationColor: product.variation_color,
                    currentStock: currentStock,
                    predictedDemand: predictedDemand,
                    suggestedQuantity: suggestedQuantity,
                    reason: 'Previsão de Demanda e Estoque Baixo',
                });
            }
        }
        return suggestions;
    },
};
