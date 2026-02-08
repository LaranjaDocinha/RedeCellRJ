import { AppError } from '../utils/errors.js';
import pool from '../db/index.js';
import { PoolClient } from 'pg';
import { demandPredictionService } from './demandPredictionService.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { auditService } from './auditService.js';

const NOTIFICATIONS_MICROSERVICE_URL =
  process.env.NOTIFICATIONS_MICROSERVICE_URL || 'http://localhost:3002';

export const inventoryService = {
  async getLowStockProducts(threshold: number = 10) {
    return inventoryRepository.findLowStockProducts(threshold);
  },

  async adjustStock(
    variationId: number,
    quantityChange: number,
    reason: string,
    userId?: string,
    dbClient?: PoolClient,
    unitCost?: number,
    branchId?: number,
  ) {
    const client = dbClient || (await pool.connect());
    const shouldManageTransaction = !dbClient;

    try {
      if (shouldManageTransaction) await client.query('BEGIN');

      // Use repository to lock row
      const stockInfo = await inventoryRepository.findStockForUpdate(
        variationId,
        branchId || 1,
        client,
      );

      if (!stockInfo) {
        throw new AppError('Product variation stock not found for this branch.', 404);
      }

      const newStock = stockInfo.stock_quantity + quantityChange;
      if (newStock < 0) {
        throw new AppError('Stock quantity cannot be negative.', 400);
      }

      if (quantityChange > 0 && unitCost === undefined) {
        if (reason === 'stock_received' && unitCost === undefined) {
          throw new AppError('Unit cost is required when receiving stock.', 400);
        }
      }

      // Update stock quantity
      const updatedStock = await inventoryRepository.updateStockQuantity(
        variationId,
        branchId || 1,
        newStock,
        client,
      );

      // Sugestão Sênior #8: Auditoria Temporal
      await auditService.logStockChange({
        productVariationId: variationId,
        branchId: branchId || 1,
        oldQuantity: stockInfo.stock_quantity,
        newQuantity: newStock,
        reason,
        client,
      });

      // Create movement record
      await inventoryRepository.createMovement(
        {
          product_variation_id: variationId,
          branch_id: branchId || 1,
          quantity_change: quantityChange,
          reason,
          user_id: userId,
          unit_cost: unitCost,
          quantity_remaining: quantityChange > 0 ? quantityChange : null,
        },
        client,
      );

      if (quantityChange < 0) {
        let stockToRemove = Math.abs(quantityChange);
        const purchaseLayers = await inventoryRepository.findPurchaseLayers(
          variationId,
          branchId || 1,
          client,
        );

        for (const layer of purchaseLayers) {
          if (stockToRemove <= 0) break;
          const available = layer.quantity_remaining;
          const toRemoveFromLayer = Math.min(stockToRemove, available);

          await inventoryRepository.decrementMovementRemaining(layer.id, toRemoveFromLayer, client);

          stockToRemove -= toRemoveFromLayer;
        }

        if (stockToRemove > 0) {
          throw new AppError('Not enough stock layers to fulfill the order.', 500);
        }
      }

      if (updatedStock.quantity <= stockInfo.low_stock_threshold) {
        await fetch(`${NOTIFICATIONS_MICROSERVICE_URL}/send/in-app`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Estoque baixo para o produto ${stockInfo.product_id}.`,
            type: 'low_stock_alert',
            productId: stockInfo.product_id,
            variationId: variationId,
            currentStock: updatedStock.quantity,
            threshold: stockInfo.low_stock_threshold,
          }),
        }).catch(() => console.warn('Notification microservice unreachable'));
      }

      if (shouldManageTransaction) await client.query('COMMIT');
      return updatedStock;
    } catch (error: unknown) {
      if (shouldManageTransaction) await client.query('ROLLBACK');
      throw error;
    } finally {
      if (shouldManageTransaction) client.release();
    }
  },

  async receiveStock(
    variationId: number,
    quantity: number,
    unitCost: number,
    userId?: string,
    dbClient?: PoolClient,
  ) {
    return this.adjustStock(variationId, quantity, 'stock_received', userId, dbClient, unitCost);
  },

  async dispatchStock(
    variationId: number,
    quantity: number,
    userId?: string,
    dbClient?: PoolClient,
  ) {
    return this.adjustStock(variationId, -quantity, 'stock_dispatched', userId, dbClient);
  },

  async getInventoryDiscrepancies(branchId: number): Promise<any[]> {
    return inventoryRepository.findDiscrepancies(branchId);
  },

  async suggestPurchaseOrders(branchId: number): Promise<any[]> {
    const products = await inventoryRepository.findProductsBelowThreshold(branchId);

    const suggestions: any[] = [];
    for (const product of products) {
      const predictedDemand = await demandPredictionService.predictDemand(product.product_id, 3);
      const leadTimeDemand = predictedDemand * ((product.lead_time_days || 7) / 30);
      const suggestedQuantity = Math.ceil(predictedDemand + leadTimeDemand - product.current_stock);

      if (suggestedQuantity > 0) {
        suggestions.push({
          productId: product.product_id,
          productName: product.product_name,
          variationId: product.variation_id,
          variationColor: product.variation_color,
          currentStock: product.current_stock,
          predictedDemand,
          suggestedQuantity,
          reason: 'Previsão de Demanda e Estoque Baixo',
        });
      }
    }
    return suggestions;
  },
};
