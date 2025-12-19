import { getPool } from '../db/index.js';
import { storeCreditService } from './storeCreditService.js';
import appEvents from '../events/appEvents.js';
import { inventoryValuationService } from './InventoryValuationService.js';
import { AppError } from '../utils/errors.js';
import { salesGoalService } from './salesGoalService.js';
import { customerService } from './customerService.js'; // Import customerService
import * as activityFeedService from './activityFeedService.js';
import { serializedItemService } from './serializedItemService.js'; // Import serializedItemService
import * as gamificationService from './gamificationService.js'; // Import gamificationService
import * as marketplaceSyncService from './marketplaceSyncService.js'; // Import marketplaceSyncService

// ... (interfaces remain the same)

export const saleService = {
  async createSale({
    customerId,
    items,
    payments,
    userId,
    branchId = 1,
    client: externalClient,
    externalOrderId,
    marketplaceIntegrationId,
  }: {
    customerId?: string;
    items: any[];
    payments: any[];
    userId?: string;
    branchId?: number;
    client?: any;
    externalOrderId?: string;
    marketplaceIntegrationId?: number;
  }) {
    console.log('Received userId:', userId);
    console.log('[createSale] saleData:', { customerId, items, payments, userId, branchId, externalOrderId, marketplaceIntegrationId });
    console.log('[createSale] Service started');
    const client = externalClient || (await getPool().connect());
    console.log('[createSale] DB client connected');
    try {
      await client.query('BEGIN');
      console.log('[createSale] Transaction started');

      let totalAmount = 0;
      const saleItems: any[] = [];

      console.log(`[createSale] Processing ${items.length} items...`);
      for (const item of items) {
        console.log(`[createSale] Processing item: ${JSON.stringify(item)}`);
        console.log(
          `[createSale] Searching for variation_id: ${item.variation_id} in branch: ${branchId}`,
        );
        
        // Updated query to include is_serialized from products table
        const { rows: variationRows } = await client.query(
          `SELECT pv.price, ps.stock_quantity, pv.cost_price, p.is_serialized 
           FROM product_variations pv 
           JOIN branch_product_variations_stock ps ON pv.id = ps.product_variation_id 
           JOIN products p ON pv.product_id = p.id
           WHERE pv.id = $1 AND ps.branch_id = $2 FOR UPDATE`,
          [item.variation_id, branchId],
        );
        console.log(
          `[createSale] Query result for variation ${item.variation_id}: ${JSON.stringify(variationRows)}`,
        );
        const variation = variationRows[0];
        console.log(`[createSale] Fetched variation: ${JSON.stringify(variation)}`);

        if (!variation) {
          throw new AppError(`Product variation ${item.variation_id} not found`, 404);
        }

        // Serialized Item Logic
        if (variation.is_serialized) {
            if (!item.serial_numbers || !Array.isArray(item.serial_numbers) || item.serial_numbers.length !== item.quantity) {
                throw new AppError(`Product variation ${item.variation_id} is serialized and requires ${item.quantity} serial numbers.`, 400);
            }

            for (const serial of item.serial_numbers) {
                // Check if serial exists and is available
                const { rows: serialRows } = await client.query(
                    `SELECT id, status FROM serialized_items WHERE serial_number = $1 AND product_variation_id = $2 AND branch_id = $3 FOR UPDATE`,
                    [serial, item.variation_id, branchId]
                );

                if (serialRows.length === 0) {
                    throw new AppError(`Serial number ${serial} not found for this product/branch.`, 400);
                }
                const serialItem = serialRows[0];

                if (serialItem.status !== 'in_stock') {
                    throw new AppError(`Serial number ${serial} is not available (Status: ${serialItem.status}).`, 400);
                }

                // Update status to sold
                await client.query(
                    `UPDATE serialized_items SET status = 'sold', updated_at = NOW() WHERE id = $1`,
                    [serialItem.id]
                );
                
                // Log history (Manual insert since we are in a transaction and service doesn't support client injection yet)
                await client.query(
                  'INSERT INTO serialized_items_history (serialized_item_id, action, old_status, new_status, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
                  [serialItem.id, 'sale', 'in_stock', 'sold', userId, JSON.stringify({ saleId: 'PENDING' })] // We'll update saleId later or ignore for now
                );
            }
        } else {
            // Non-serialized logic: Check quantity only
            if (variation.stock_quantity < item.quantity) {
                throw new AppError(`Insufficient stock for product variation ${item.variation_id}`, 400);
            }
        }

        console.log(
          `[createSale] item.unit_price: ${item.unit_price}, item.quantity: ${item.quantity}`,
        );
        const itemTotalPrice = item.unit_price * item.quantity;
        totalAmount += itemTotalPrice;
        console.log(
          `[createSale] Item total: ${itemTotalPrice}, Running sale total: ${totalAmount}`,
        );

        saleItems.push({
          product_id: item.product_id,
          variation_id: item.variation_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          cost_price: parseFloat(variation.cost_price), // Add cost_price here
          total_price: itemTotalPrice,
          serial_numbers: item.serial_numbers // Store serials in sale item for later usage if needed (e.g. printing)
        });

        console.log(
          `[createSale] Updating stock for variation ${item.variation_id} in branch ${branchId}`,
        );
        await client.query(
          'UPDATE branch_product_variations_stock SET stock_quantity = stock_quantity - $1 WHERE product_variation_id = $2 AND branch_id = $3',
          [item.quantity, item.variation_id, branchId],
        );
      }

      console.log(
        `[createSale] Inserting into sales table. UserID: ${userId}, CustomerID: ${customerId}, TotalAmount: ${totalAmount}`,
      );
      const { rows: saleRows } = await client.query(
        'INSERT INTO sales (user_id, customer_id, total_amount, external_order_id, marketplace_integration_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, sale_date',
        [userId, customerId, totalAmount, externalOrderId, marketplaceIntegrationId],
      );
      const newSale = saleRows[0];
      console.log(`[createSale] Sale created with ID: ${newSale.id}`);

      console.log(`[createSale] Inserting ${saleItems.length} sale items...`);

      // Validate total payments match total amount
      const totalPaymentsAmount = payments.reduce(
        (sum: number, payment: any) => sum + payment.amount,
        0,
      );
      if (totalPaymentsAmount !== totalAmount) {
        throw new AppError('Sum of payments does not match total sale amount', 400);
      }
      for (const si of saleItems) {
        await client.query(
          'INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, unit_price, cost_price, total_price, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            newSale.id,
            si.product_id,
            si.variation_id,
            si.quantity,
            si.unit_price,
            si.cost_price,
            si.total_price,
            si.serial_numbers ? JSON.stringify({ serial_numbers: si.serial_numbers }) : null
          ],
        );
      }

      console.log(`[createSale] Inserting ${payments.length} payments...`);
      for (const payment of payments) {
        if (payment.method === 'store_credit') {
          if (!customerId) {
            throw new AppError('Customer ID is required for store credit payment', 400);
          }
          const customer = await customerService.getCustomerById(customerId);
          if (!customer) {
            throw new AppError('Customer not found for store credit payment', 404);
          }
          if (parseFloat(customer.store_credit_balance) < payment.amount) {
            throw new AppError('Insufficient store credit', 400);
          }
          await customerService.deductStoreCredit(customerId, payment.amount, newSale.id, client);
        }
        await client.query(
          'INSERT INTO sale_payments (sale_id, payment_method, amount, transaction_details) VALUES ($1, $2, $3, $4)',
          [
            newSale.id,
            payment.method,
            payment.amount,
            payment.transactionId ? { id: payment.transactionId } : null,
          ],
        );
      }

      // Add to activity feed
      try {
        await activityFeedService.createActivity(
          userId,
          branchId,
          'sale',
          { saleId: newSale.id, totalAmount },
          client,
        );
      } catch (feedError) {
        console.error('Error adding to activity feed:', feedError);
      }

      // Cashback Logic
      if (customerId) {
        const cashbackAmount = totalAmount * 0.01; // 1% Cashback
        if (cashbackAmount > 0) {
           try {
             await customerService.addStoreCredit(customerId, cashbackAmount, String(newSale.id), client, 'Cashback Reward');
             console.log(`[createSale] Awarded ${cashbackAmount} cashback to customer ${customerId}`);
           } catch (cashbackError) {
             console.error('Error awarding cashback:', cashbackError);
             // Don't fail sale if cashback fails
           }
        }
      }

      console.log('[createSale] Committing transaction...');
      await client.query('COMMIT');
      console.log('[createSale] Transaction committed');

      // Update Gamification Challenges
      if (userId) {
        try {
          gamificationService.updateChallengeProgress(userId, 'sales_amount', totalAmount);
          gamificationService.updateChallengeProgress(userId, 'sales_count', 1);
        } catch (e) {
          console.error('Error updating gamification progress:', e);
        }
      }

      // Sync Marketplace Stock
      try {
        // Fire and forget
        marketplaceSyncService.updateStockOnSale(saleItems.map(item => ({ variation_id: item.variation_id, quantity: item.quantity })));
      } catch (e) {
        console.error('Error syncing marketplace stock:', e);
      }

      // Check for badge awards
      try {
        // await salesGoalService.checkAndAwardBadges(userId); // TODO: Função não encontrada
      } catch (badgeError) {
        console.error('Error checking or awarding badges:', badgeError);
        // Do not block sale completion if badge awarding fails
      }

      const result = {
        sale_id: newSale.id,
        userId: userId,
        customerId: customerId,
        total_amount: totalAmount,
        items: saleItems,
        created_at: newSale.sale_date,
      };

      console.log('[createSale] Emitting sale.created event...');
      appEvents.emit('sale.created', { sale: result });
      console.log('[createSale] Event emitted');

      // Add to activity feed
      try {
        await activityFeedService.createActivity(
          userId,
          branchId,
          'sale',
          { saleId: newSale.id, totalAmount },
          client,
        );
      } catch (feedError) {
        console.error('Error adding to activity feed:', feedError);
      }

      return result;
    } catch (error) {
      console.error('[createSale] ERROR! Rolling back transaction.', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      if (!externalClient) {
        console.log('[createSale] Releasing client');
        client.release();
      }
    }
  },

  async getSaleById(saleId: number) {
    const pool = getPool();
    const saleRes = await pool.query('SELECT * FROM sales WHERE id = $1', [saleId]);
    if (saleRes.rows.length === 0) {
      return null;
    }
    const sale = saleRes.rows[0];

    const itemsRes = await pool.query('SELECT * FROM sale_items WHERE sale_id = $1', [saleId]);
    const paymentsRes = await pool.query('SELECT * FROM sale_payments WHERE sale_id = $1', [
      saleId,
    ]);

    return {
      ...sale,
      items: itemsRes.rows,
      payments: paymentsRes.rows,
    };
  },

  async getAllSales() {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
    return result.rows;
  },
};
