import pool from '../db/index.js';
import { PoolClient } from 'pg';
import { AppError } from '../utils/errors.js';
import { discountService } from './discountService.js'; // Import discountService
import { productKitService } from './productKitService.js'; // Import productKitService
import { notificationEmitter } from '../utils/notificationEmitter.js'; // Import notificationEmitter

interface SaleItemInput {
  product_id?: number; // Optional if kit_id is present
  variation_id?: number; // Optional if kit_id is present
  quantity: number;
  kit_id?: number; // New: Optional kit ID
}

export const saleService = {
  async createSale(userId: number | null, items: SaleItemInput[], discountId?: number, paymentMethod?: string, transactionId?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let totalAmount = 0;
      const saleItemsDetails = [];

      // Validate items and calculate total amount
      for (const item of items) {
        if (item.kit_id) {
          // Handle product kit
          const productKit = await productKitService.getProductKitById(item.kit_id);
          if (!productKit) {
            throw new AppError(`Product kit ${item.kit_id} not found.`, 404);
          }

          // Deduct stock for each item in the kit
          for (const kitItem of productKit.items!) {
            const productVariationResult = await client.query(
              'SELECT stock_quantity FROM product_variations WHERE id = $1 AND product_id = $2;',
              [kitItem.variation_id, kitItem.product_id]
            );
            if (productVariationResult.rows.length === 0) {
              throw new AppError(`Product variation ${kitItem.variation_id} from kit ${item.kit_id} not found.`, 404);
            }
            const { stock_quantity } = productVariationResult.rows[0];
            if (stock_quantity < kitItem.quantity * item.quantity) {
              throw new AppError(`Insufficient stock for kit item variation ${kitItem.variation_id}. Available: ${stock_quantity}, Requested: ${kitItem.quantity * item.quantity}`, 400);
            }
            await client.query(
              'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2;',
              [kitItem.quantity * item.quantity, kitItem.variation_id]
            );
          }

          totalAmount += parseFloat(productKit.price.toString()) * item.quantity; // Use kit price
          saleItemsDetails.push({ ...item, price_at_sale: parseFloat(productKit.price.toString()), is_kit: true, kit_details: productKit.items });

        } else if (item.product_id && item.variation_id) {
          // Handle individual product variation
          const productVariationResult = await client.query(
            'SELECT price, stock_quantity FROM product_variations WHERE id = $1 AND product_id = $2;',
            [item.variation_id, item.product_id]
          );

          if (productVariationResult.rows.length === 0) {
            throw new AppError(`Product variation ${item.variation_id} not found.`, 404);
          }

          const { price, stock_quantity } = productVariationResult.rows[0];

          if (stock_quantity < item.quantity) {
            throw new AppError(`Insufficient stock for variation ${item.variation_id}. Available: ${stock_quantity}, Requested: ${item.quantity}`, 400);
          }

          const itemPrice = parseFloat(price) * item.quantity;
          totalAmount += itemPrice;
          saleItemsDetails.push({ ...item, price_at_sale: parseFloat(price) });

          // Update stock quantity
          await client.query(
            'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2;',
            [item.quantity, item.variation_id]
          );
        } else {
          throw new AppError('Invalid sale item: missing product_id/variation_id or kit_id', 400);
        }
      }

      // Apply discount if provided
      let appliedDiscountId = null;
      if (discountId) {
        const discountedAmount = await discountService.applyDiscount(discountId, totalAmount);
        totalAmount = discountedAmount;
        appliedDiscountId = discountId;
      }

      // Insert sale record
      const saleResult = await client.query(
        'INSERT INTO sales (user_id, total_amount, discount_id, payment_method, transaction_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, sale_date;',
        [userId, totalAmount, appliedDiscountId, paymentMethod, transactionId]
      );
      const newSale = saleResult.rows[0];

      // Insert sale items
      for (const itemDetail of saleItemsDetails) {
        await client.query(
          'INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4, $5);',
          [newSale.id, itemDetail.product_id, itemDetail.variation_id, itemDetail.quantity, itemDetail.price_at_sale]
        );
      }

      await client.query('COMMIT');
      notificationEmitter.emitNewOrder(newSale.id, `New sale created: ${newSale.id} for ${totalAmount.toFixed(2)}`); // Emit notification
      return { ...newSale, total_amount: totalAmount, items: saleItemsDetails };
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async getSaleById(saleId: number) {
    const saleResult = await pool.query('SELECT * FROM sales WHERE id = $1;', [saleId]);
    if (saleResult.rows.length === 0) return null;

    const sale = saleResult.rows[0];

    const itemsResult = await pool.query('SELECT * FROM sale_items WHERE sale_id = $1;', [saleId]);
    sale.items = itemsResult.rows;

    return sale;
  },

  async getAllSales() {
    const { rows } = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC;');
    // Para cada venda, buscar seus itens
    for (const sale of rows) {
      const itemsResult = await pool.query('SELECT * FROM sale_items WHERE sale_id = $1;', [sale.id]);
      sale.items = itemsResult.rows;
    }
    return rows;
  },

};
