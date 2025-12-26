import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { NotFoundError, ValidationError } from '../utils/errors.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // Import auth middleware
import { productService } from '../services/productService.js';
import { priceSuggestionService } from '../services/priceSuggestionService.js'; // Added import
import { auditService } from '../services/auditService.js'; // Import auditService
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js'; // Importar cacheMiddleware

// Zod Schemas
const variationSchema = z.object({
  id: z.number().int().positive().optional(),
  color: z.string().trim().nonempty('Cor é obrigatória'),
  storage_capacity: z.string().trim().optional(), // New field
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
  is_serialized: z.boolean().optional(), // Added
  // product_type: string; // Removido
  variations: z.array(variationSchema).min(1, 'Adicione pelo menos uma variação'),
  // is_used?: boolean; // Removido
  // condition?: string; // Removido
  // acquisition_date?: string; // Removido
});

const updateProductSchema = z.object({
  name: z.string().trim().nonempty('Product name cannot be empty').optional(),
  branch_id: z.coerce.number().positive('A valid branch ID is required').optional(),
  is_serialized: z.boolean().optional(), // Added
  variations: z.array(variationSchema).optional(),
  // is_used?: boolean; // Removido
  // condition?: string; // Removido
  // acquisition_date?: string; // Removido
});

const suggestPriceSchema = z.object({
  competitorPrice: z.number().positive('Competitor price must be positive').optional(),
  marketData: z.any().optional(), // Flexible for additional market data
});

import { validate } from '../middlewares/validationMiddleware.js';

const createProductRouter = () => {
  const router = Router();

  // Autenticação é obrigatória para todas as rotas
  router.use(authMiddleware.authenticate);

  // Rota de variações (leitura)
  router.get('/variations', authMiddleware.authorize('read', 'Product'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const variations = await productService.getAllProductVariations();
        res.status(200).json(variations);
    } catch (error) {
        next(error);
    }
  });

  // Listagem de produtos (leitura)
  router.get(
    '/',
    authMiddleware.authorize('read', 'Product'),
    cacheMiddleware(),
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
      res.status(200).json(paginatedProducts);
    } catch (error) {
      next(error);
    }
  });

  // Criar produto (manage)
  router.post(
    '/',
    authMiddleware.authorize('manage', 'Product'),
    validate(createProductSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      const newProduct = await productService.createProduct(req.body);
      res.status(201).json(newProduct);
    },
  );

  // Ver produto por ID (leitura)
  router.get('/:id', authMiddleware.authorize('read', 'Product'), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new NotFoundError('Invalid product ID');
      }
      const product = await productService.getProductById(id);
      if (product) {
        res.status(200).json(product);
      } else {
        throw new NotFoundError('Product not found');
      }
    } catch (error) {
      next(error);
    }
  });

  // Histórico de preços (leitura)
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
        res.status(200).json(priceHistory);
      } catch (error) {
        next(error);
      }
    },
  );

  // Sugestão de preço (leitura)
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
          res.status(200).json({ suggested_price: suggestedPrice });
        } else {
          res.status(404).json({ message: 'Product not found or not a used product' });
        }
      } catch (error) {
        next(error);
      }
    },
  );

  // Solicitar sugestão de preço (manage/update)
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
        const suggestion = await priceSuggestionService.suggestProductPrice(productId, competitorPrice, marketData);
        res.status(200).json(suggestion);
      } catch (error) {
        next(error);
      }
    }
  );

  // Atualizar produto (manage)
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
          res.status(200).json(updatedProduct);
        } else {
          throw new NotFoundError('Product not found');
        }
      } catch (error) {
        next(error);
      }
    },
  );

  // Excluir produto (manage)
  router.delete('/:id', authMiddleware.authorize('manage', 'Product'), async (req: Request, res: Response, next: NextFunction) => {
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
  });

  return router;
};

export { createProductRouter };
