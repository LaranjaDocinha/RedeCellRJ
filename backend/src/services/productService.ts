// Ideally repo should expose a way to get client or run in transaction.
// For now, we get pool to connect client, and pass client to repo methods.
import pool from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { dynamicPricingService } from './dynamicPricingService.js';
import redisClient from '../utils/redisClient.js';
import crypto from 'crypto';
import {
  productRepository,
  GetProductOptions,
  PaginatedProducts,
} from '../repositories/product.repository.js';
import { auditLogger } from '../utils/auditLogger.js';

interface ProductVariationInput {
  id?: number;
  color: string;
  storage_capacity?: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold?: number;
}

interface ProductCreateInput {
  name: string;
  branch_id: number;
  sku: string;
  is_serialized?: boolean;
  variations: ProductVariationInput[];
}

interface ProductUpdateInput {
  name?: string;
  branch_id?: number;
  is_serialized?: boolean;
  variations?: ProductVariationInput[];
}

export const productService = {
  async getAllProducts(options: GetProductOptions = {}): Promise<PaginatedProducts> {
    try {
      const totalCount = await productRepository.count(options);
      const products = await productRepository.findAll(options);
      return { products, totalCount };
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error;
    }
  },

  async getAllProductVariations(): Promise<any[]> {
    const variations = await productRepository.findAllVariations();
    return variations.map((row: any) => ({
      id: row.id,
      sku: row.sku,
      name: `${row.product_name} (${row.variation_name || row.sku})`,
    }));
  },

  async getProductById(id: number) {
    const cacheKey = `product:${id}`;
    const cachedProduct = await redisClient.get(cacheKey);
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const product = await productRepository.findById(id);
    if (!product) {
      return null;
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
    return product;
  },

  async createProduct(productData: ProductCreateInput) {
    const { name, branch_id, sku, variations, is_serialized } = productData;

    const client = await pool.connect();
    let newProductId: number | undefined;

    try {
      await client.query('BEGIN');
      console.log('Attempting to insert product:', { name, branch_id, sku, variations });

      newProductId = await productRepository.createProduct(
        {
          name,
          branch_id,
          sku,
          is_serialized,
        },
        client,
      );

      console.log('Product inserted, newProductId:', newProductId);

      const variationsLogged: any[] = [];
      for (const v of variations) {
        const variationName = `${v.color} ${v.storage_capacity || ''}`.trim();
        const variationSku = `${sku}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

        const variationId = await productRepository.createVariation(
          {
            product_id: newProductId,
            name: variationName,
            sku: variationSku,
            price: v.price,
          },
          client,
        );

        await productRepository.createOrUpdateStock(
          {
            branch_id,
            product_variation_id: variationId,
            stock_quantity: v.stock_quantity,
            min_stock_level: v.low_stock_threshold || 0,
          },
          client,
        );

        variationsLogged.push({
          id: variationId,
          name: variationName,
          sku: variationSku,
          price: v.price,
          stock: v.stock_quantity,
        });
      }

      // Auditoria de Criação
      await auditLogger.logCreate(
        'Product',
        newProductId,
        { name, branch_id, sku, is_serialized, variations: variationsLogged },
        client,
      );

      await client.query('COMMIT');
    } catch (error: unknown) {
      if (client) await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      if (client) client.release();
    }

    if (newProductId) {
      const cacheKey = `product:${newProductId}`;
      await redisClient.del(cacheKey);
      return await this.getProductById(newProductId);
    }
    throw new Error('Failed to create product');
  },

  async updateProduct(id: number, productData: ProductUpdateInput) {
    const { name, variations, is_serialized, branch_id } = productData;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const oldProduct = await productRepository.findById(id);
      if (!oldProduct) {
        throw new NotFoundError('Product not found');
      }
      // Cast to any to access properties for SKU generation safely if needed,
      // or assume repository returned enough info.
      const existingProduct = oldProduct as any;
      const targetBranchId = branch_id || existingProduct.branch_id;

      const productFields: string[] = [];
      const productValues: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        productFields.push(`name = $${paramIndex++}`);
        productValues.push(name);
      }
      if (is_serialized !== undefined) {
        productFields.push(`is_serialized = $${paramIndex++}`);
        productValues.push(is_serialized);
      }
      if (branch_id !== undefined) {
        productFields.push(`branch_id = $${paramIndex++}`);
        productValues.push(branch_id);
      }

      if (productFields.length > 0) {
        await productRepository.updateProduct(id, productFields, productValues, client);
      }

      if (variations) {
        const existingVariationIds = new Set(await productRepository.getVariationIds(id, client));
        const incomingVariationIds = new Set(
          variations.filter((v) => v.id).map((v) => v.id as number),
        );

        const idsToDelete = [...existingVariationIds].filter(
          (existingId) => !incomingVariationIds.has(existingId),
        );
        if (idsToDelete.length > 0) {
          await productRepository.deleteVariations(idsToDelete, client);
        }

        for (const variation of variations) {
          const variationName = `${variation.color} ${variation.storage_capacity || ''}`.trim();

          if (variation.id && existingVariationIds.has(variation.id)) {
            const oldPrice = await productRepository.getVariationPrice(variation.id, client);

            await productRepository.updateVariation(
              variation.id,
              variationName,
              variation.price,
              client,
            );

            await productRepository.createOrUpdateStock(
              {
                branch_id: targetBranchId,
                product_variation_id: variation.id,
                stock_quantity: variation.stock_quantity,
                min_stock_level: variation.low_stock_threshold || 0,
              },
              client,
            );

            if (oldPrice !== undefined && oldPrice !== variation.price) {
              await productRepository.recordPriceHistory(
                variation.id,
                oldPrice,
                variation.price,
                'Update via API',
                client,
              );
            }
          } else if (!variation.id) {
            const variationSku = `${existingProduct.sku}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

            const newVarId = await productRepository.createVariation(
              {
                product_id: id,
                name: variationName,
                sku: variationSku,
                price: variation.price,
              },
              client,
            );

            await productRepository.createOrUpdateStock(
              {
                branch_id: targetBranchId,
                product_variation_id: newVarId,
                stock_quantity: variation.stock_quantity,
                min_stock_level: variation.low_stock_threshold || 0,
              },
              client,
            );
          }
        }
      }

      // Fetch new state for auditing
      const newProduct = await productRepository.findById(id);
      await auditLogger.logUpdate('Product', id, oldProduct, newProduct, client);

      await client.query('COMMIT');
    } catch (error: unknown) {
      if (client) await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      if (client) client.release();
    }

    const cacheKey = `product:${id}`;
    await redisClient.del(cacheKey);
    return await this.getProductById(id);
  },

  async deleteProduct(id: number) {
    const oldProduct = await productRepository.findById(id);
    const result = await productRepository.delete(id);
    if (result && oldProduct) {
      await auditLogger.logDelete('Product', id, oldProduct);
    }
    return result;
  },

  async getProductPriceHistory(productId: number, variationId: number) {
    return productRepository.getPriceHistory(variationId);
  },

  async getSuggestedUsedProductPrice(productId: number): Promise<number | null> {
    return dynamicPricingService.getSuggestedUsedProductPrice(productId);
  },
};
