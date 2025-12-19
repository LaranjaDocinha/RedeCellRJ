import { AppError } from '../utils/errors.js';
import pool from '../db/index.js';
const NOTIFICATIONS_MICROSERVICE_URL = process.env.NOTIFICATIONS_MICROSERVICE_URL || 'http://localhost:3002';
export const inventoryService = {
    async getLowStockProducts(threshold = 10) {
        // ... (existing code)
    },
    async adjustStock(variationId, quantityChange, reason, userId, dbClient, unitCost) {
        const client = dbClient || (await pool.connect());
        const shouldManageTransaction = !dbClient;
        try {
            if (shouldManageTransaction)
                await client.query('BEGIN');
            const { rows: [variation], } = await client.query('SELECT stock_quantity, low_stock_threshold, product_id, branch_id FROM product_variations WHERE id = $1 FOR UPDATE', [variationId]);
            if (!variation) {
                throw new AppError('Product variation not found.', 404);
            }
            const newStock = variation.stock_quantity + quantityChange;
            if (newStock < 0) {
                throw new AppError('Stock quantity cannot be negative.', 400);
            }
            if (quantityChange > 0 && unitCost === undefined) {
                throw new AppError('Unit cost is required when adding stock.', 400);
            }
            // Update stock quantity
            const { rows: [updatedVariation], } = await client.query('UPDATE product_variations SET stock_quantity = $1 WHERE id = $2 RETURNING *', [newStock, variationId]);
            // Record inventory movement
            await client.query('INSERT INTO inventory_movements (product_variation_id, branch_id, quantity_change, reason, user_id, unit_cost, quantity_remaining) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
                variationId,
                variation.branch_id,
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
           WHERE product_variation_id = $1 AND quantity_change > 0 AND quantity_remaining > 0
           ORDER BY created_at ASC`, [variationId]);
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
            if (updatedVariation.stock_quantity <= updatedVariation.low_stock_threshold) {
                // Emitir notificação de estoque baixo via microservice
                await fetch(`${NOTIFICATIONS_MICROSERVICE_URL}/send/in-app`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Estoque baixo para o produto ${updatedVariation.product_id}, variação ${updatedVariation.id}. Quantidade atual: ${updatedVariation.stock_quantity}, Limite: ${updatedVariation.low_stock_threshold}.`,
                        type: 'low_stock_alert',
                        productId: updatedVariation.product_id,
                        variationId: updatedVariation.id,
                        currentStock: updatedVariation.stock_quantity,
                        threshold: updatedVariation.low_stock_threshold,
                    }),
                });
            }
            if (shouldManageTransaction)
                await client.query('COMMIT');
            return updatedVariation;
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
    // ... (existing recordInventoryMovement method)
};
