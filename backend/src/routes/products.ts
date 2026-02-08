import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { NotFoundError } from '../utils/errors.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { productService } from '../services/productService.js';
import { priceSuggestionService } from '../services/priceSuggestionService.js';
import { auditService } from '../services/auditService.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import { ResponseHelper } from '../utils/responseHelper.js';

// Zod Schemas
const variationSchema = z.object({
  id: z.number().int().positive().optional(),
  color: z.string().trim().nonempty('Cor é obrigatória'),
  storage_capacity: z.string().trim().optional(),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  stock_quantity: z.coerce.number().int().min(0, 'Estoque não pode ser negativo'),
  low_stock_threshold: z.coerce
    .number()
    .int()
    .min(0, 'Alerta de estoque não pode ser negativo')
    .optional(),
});

const createProductSchema = z.object({
  name: z.string().trim().nonempty('Nome do produto é obrigatório'),
  branch_id: z.coerce.number().positive('A valid branch ID is required'),
  sku: z.string().trim().nonempty('SKU é obrigatório'),
  is_serialized: z.boolean().optional(),
  variations: z.array(variationSchema).min(1, 'Adicione pelo menos uma variação'),
});

const updateProductSchema = z.object({
  name: z.string().trim().nonempty('Product name cannot be empty').optional(),
  branch_id: z.coerce.number().positive('A valid branch ID is required').optional(),
  is_serialized: z.boolean().optional(),
  variations: z.array(variationSchema).optional(),
});

const suggestPriceSchema = z.object({
  competitorPrice: z.number().positive('Competitor price must be positive').optional(),
  marketData: z.any().optional(),
});

import { validate } from '../middlewares/validationMiddleware.js';

const createProductRouter = () => {
  const router = Router();

  router.use(authMiddleware.authenticate);

  router.get(
    '/variations',
    authMiddleware.authorize('read', 'Product'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const variations = await productService.getAllProductVariations();
        ResponseHelper.success(res, variations);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/',
    authMiddleware.authorize('read', 'Product'),
    cacheMiddleware({ duration: 300, keyPrefix: 'products' }), // Cache por 5 minutos
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          search,
          categoryId,
          branchId,
          isSerialized,
          minPrice,
          maxPrice,
          sortBy,
          sortDirection,
          limit,
          offset,
        } = req.query;

        const productsOptions = {
          search: search ? String(search) : undefined,
          categoryId: categoryId ? parseInt(String(categoryId), 10) : undefined,
          branchId: branchId ? parseInt(String(branchId), 10) : undefined,
          isSerialized: isSerialized ? String(isSerialized).toLowerCase() === 'true' : undefined,
          minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
          maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
          sortBy: sortBy ? String(sortBy) : undefined,
          sortDirection: sortDirection === 'DESC' ? 'DESC' : 'ASC',
          limit: limit ? parseInt(String(limit), 10) : undefined,
          offset: offset ? parseInt(String(offset), 10) : undefined,
        };

        const paginatedProducts = await productService.getAllProducts(productsOptions);
        ResponseHelper.success(res, paginatedProducts);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/',
    authMiddleware.authorize('manage', 'Product'),
    validate(createProductSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const newProduct = await productService.createProduct(req.body);
        ResponseHelper.created(res, newProduct);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/:id',
    authMiddleware.authorize('read', 'Product'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          throw new NotFoundError('Invalid product ID');
        }
        const product = await productService.getProductById(id);
        if (product) {
          ResponseHelper.success(res, product);
        } else {
          throw new NotFoundError('Product not found');
        }
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/:productId/variations/:variationId/price-history',
    authMiddleware.authorize('read', 'Product'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const productId = parseInt(req.params.productId);
        const variationId = parseInt(req.params.variationId);

        if (isNaN(productId) || isNaN(variationId)) {
          throw new NotFoundError('Invalid product ID or variation ID');
        }

        const priceHistory = await productService.getProductPriceHistory(productId, variationId);
        ResponseHelper.success(res, priceHistory);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/:id/suggested-used-price',
    authMiddleware.authorize('read', 'Product'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
          throw new NotFoundError('Invalid product ID');
        }
        const suggestedPrice = await productService.getSuggestedUsedProductPrice(productId);
        if (suggestedPrice !== null) {
          ResponseHelper.success(res, { suggested_price: suggestedPrice });
        } else {
          res.status(404).json({ message: 'Product not found or not a used product' });
        }
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/:id/suggest-price',
    authMiddleware.authorize('manage', 'Product'),
    validate(suggestPriceSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
          throw new NotFoundError('Invalid product ID');
        }
        const { competitorPrice, marketData } = req.body;
        const suggestion = await priceSuggestionService.suggestProductPrice(
          productId,
          competitorPrice,
          marketData,
        );
        ResponseHelper.success(res, suggestion);
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    '/:id',
    authMiddleware.authorize('manage', 'Product'),
    validate(updateProductSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          throw new NotFoundError('Invalid product ID');
        }
        const updatedProduct = await productService.updateProduct(id, req.body);

        if (updatedProduct) {
          ResponseHelper.success(res, updatedProduct);
        } else {
          throw new NotFoundError('Product not found');
        }
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete(
    '/:id',
    authMiddleware.authorize('manage', 'Product'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          throw new NotFoundError('Invalid product ID');
        }
        const deleted = (await productService.deleteProduct(id)) as boolean;

        if (deleted) {
          res.status(204).send();
          auditService.recordAuditLog({
            userId: (req as any).user?.id,
            action: 'DELETE',
            details: { productId: id, entityType: 'Product' },
          });
        } else {
          throw new NotFoundError('Product not found');
        }
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
};

export { createProductRouter };
