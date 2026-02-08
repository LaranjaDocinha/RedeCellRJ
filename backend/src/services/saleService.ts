import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { productRepository } from '../repositories/product.repository.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { saleRepository } from '../repositories/sale.repository.js';
import { customerService } from './customerService.js';
import * as activityFeedService from './activityFeedService.js';
import { addJob, defaultQueue } from '../jobs/queue.js';
import appEvents from '../events/appEvents.js';
import { commissionService } from './commissionService.js';
import { loyaltyService } from './loyaltyService.js';
import { salesGoalService } from './salesGoalService.js';
import { marketplaceSyncService } from './marketplaceSyncService.js';
import { triggerWebhook } from './webhookService.js';
import { transactionManager } from '../utils/transactionManager.js';

export const saleService = {
  async createSale(saleData: {
    customerId?: string;
    items: any[];
    payments: any[];
    userId?: string;
    branchId?: number;
    client?: any;
    externalOrderId?: string;
    marketplaceIntegrationId?: number;
  }) {
    const { branchId = 1, client: externalClient } = saleData;

    // Use transactionManager ONLY if no external client is provided
    const executionLogic = async (client: any) => {
      const saleItems = await this.validateAndProcessItems(
        saleData.items,
        branchId,
        saleData.userId,
        client,
      );
      const totalAmount = saleItems.reduce((sum, item) => sum + item.total_price, 0);

      this.validatePayments(saleData.payments, totalAmount);

      const newSale = await saleRepository.create(
        {
          user_id: saleData.userId,
          customer_id: saleData.customerId,
          total_amount: totalAmount,
          external_order_id: saleData.externalOrderId,
          marketplace_integration_id: saleData.marketplaceIntegrationId,
        },
        client,
      );

      await this.saveSaleDetails(
        newSale.id,
        saleItems,
        saleData.payments,
        saleData.customerId,
        client,
      );
      await this.handlePostSaleSync(
        saleData.userId,
        saleData.customerId,
        branchId,
        newSale.id,
        totalAmount,
        client,
      );

      const result = {
        id: newSale.id,
        sale_id: newSale.id,
        user_id: saleData.userId,
        userId: saleData.userId,
        customerId: saleData.customerId,
        total_amount: totalAmount,
        items: saleItems,
        created_at: newSale.sale_date,
        branchId,
      };

      return result;
    };

    const result = await (externalClient ? executionLogic(externalClient) : transactionManager.run(executionLogic));

    await addJob(defaultQueue, 'processPostSale', result);
    appEvents.emit('sale.created', { sale: result });

    return result;
  },

  async validateAndProcessItems(items: any[], branchId: number, userId?: string, client?: any) {
    const processedItems: any[] = [];
    for (const item of items) {
      const variation = await productRepository.findVariationWithStockForUpdate(
        item.variation_id,
        branchId,
        client,
      );
      if (!variation) throw new AppError(`Product variation ${item.variation_id} not found`, 404);

      if (variation.is_serialized) {
        await this.processSerializedItems(item, branchId, userId, client);
      } else if (variation.stock_quantity < item.quantity) {
        throw new AppError(`Insufficient stock for product variation ${item.variation_id}`, 400);
      }

      const itemTotalPrice = item.unit_price * item.quantity;
      processedItems.push({
        product_id: item.product_id,
        variation_id: item.variation_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: parseFloat(variation.cost_price),
        total_price: itemTotalPrice,
        serial_numbers: item.serial_numbers,
        category_id: variation.category_id,
      });

      await inventoryRepository.decreaseStock(item.quantity, item.variation_id, branchId, client);
    }
    return processedItems;
  },

  async processSerializedItems(item: any, branchId: number, userId?: string, client?: any) {
    if (
      !item.serial_numbers ||
      !Array.isArray(item.serial_numbers) ||
      item.serial_numbers.length !== item.quantity
    ) {
      throw new AppError(
        `Product variation ${item.variation_id} is serialized and requires ${item.quantity} serial numbers.`,
        400,
      );
    }

    for (const serial of item.serial_numbers) {
      const serialItem = await productRepository.findSerializedItemForUpdate(
        serial,
        item.variation_id,
        branchId,
        client,
      );
      if (!serialItem)
        throw new AppError(`Serial number ${serial} not found for this product/branch.`, 400);
      if (serialItem.status !== 'in_stock')
        throw new AppError(
          `Serial number ${serial} is not available (Status: ${serialItem.status}).`,
          400,
        );

      await productRepository.updateSerializedItemStatus(serialItem.id, 'sold', client);
      await productRepository.logSerializedItemHistory(
        {
          serialized_item_id: serialItem.id,
          action: 'sale',
          old_status: 'in_stock',
          new_status: 'sold',
          user_id: userId,
          details: JSON.stringify({ saleId: 'PENDING' }),
        },
        client,
      );
    }
  },

  validatePayments(payments: any[], totalAmount: number) {
    const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaymentsAmount - totalAmount) > 0.01) {
      throw new AppError('Sum of payments does not match total sale amount', 400);
    }
  },

  async saveSaleDetails(
    saleId: number,
    items: any[],
    payments: any[],
    customerId?: string,
    client?: any,
  ) {
    for (const si of items) {
      await saleRepository.addItem(
        {
          sale_id: saleId,
          product_id: si.product_id,
          variation_id: si.variation_id,
          quantity: si.quantity,
          unit_price: si.unit_price,
          cost_price: si.cost_price,
          total_price: si.total_price,
          metadata: si.serial_numbers
            ? JSON.stringify({ serial_numbers: si.serial_numbers })
            : null,
        },
        client,
      );
    }

    for (const payment of payments) {
      if (payment.method === 'store_credit') {
        await this.handleStoreCreditPayment(customerId, payment.amount, saleId, client);
      }
      await saleRepository.addPayment(
        {
          sale_id: saleId,
          payment_method: payment.method,
          amount: payment.amount,
          transaction_details: payment.transactionId ? { id: payment.transactionId } : null,
        },
        client,
      );
    }
  },

  async handleStoreCreditPayment(
    customerId?: string,
    amount?: number,
    saleId?: number,
    client?: any,
  ) {
    if (!customerId || !amount || !saleId)
      throw new AppError('Invalid store credit payment data', 400);
    const customer = await customerService.getCustomerById(customerId);
    if (!customer) throw new AppError('Customer not found for store credit payment', 404);
    if (parseFloat(customer.store_credit_balance) < amount)
      throw new AppError('Insufficient store credit', 400);
    await customerService.deductStoreCredit(customerId, amount, String(saleId), client);
  },

  async handlePostSaleSync(
    userId: string | undefined,
    customerId: string | undefined,
    branchId: number,
    saleId: number,
    totalAmount: number,
    client: any,
  ) {
    if (userId) {
      await activityFeedService.createActivity(
        userId,
        branchId,
        'sale',
        { saleId, totalAmount },
        client,
      );
    }
    if (customerId) {
      const cashbackAmount = totalAmount * 0.01;
      if (cashbackAmount > 0) {
        await customerService.addStoreCredit(
          customerId,
          cashbackAmount,
          String(saleId),
          client,
          'Cashback Reward',
        );
      }
    }
  },

  async handlePostSale(saleData: any) {
    const { total_amount, items, customerId, branchId, sale_id } = saleData;
    if (process.env.NODE_ENV !== 'test') await commissionService.calculateForSale(saleData);

    try {
      await salesGoalService.updateDailyProgress(total_amount, branchId);
    } catch (e) {
      console.error(e);
    }
    try {
      await marketplaceSyncService.updateStockOnSale(items, branchId);
    } catch (e) {
      console.error(e);
    }
    if (customerId) {
      try {
        await loyaltyService.addPoints(customerId, total_amount, 'sale', sale_id);
      } catch (e) {
        console.error(e);
      }
    }
    try {
      await triggerWebhook('sale.completed', saleData);
    } catch (e) {
      console.error(e);
    }
  },

  async getSaleById(saleId: number) {
    return saleRepository.findById(saleId);
  },
  async getAllSales() {
    return saleRepository.findAll();
  },
};
