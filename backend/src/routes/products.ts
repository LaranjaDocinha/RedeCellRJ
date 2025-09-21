import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { NotFoundError, ValidationError } from '../utils/errors.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // Import auth middleware
import { productService } from '../services/productService.js';
import { auditService } from '../services/auditService.js'; // Import auditService

// Zod Schemas
const variationSchema = z.object({
  id: z.number().int().positive().optional(),
  color: z.string().trim().nonempty('Variation color is required'),
  price: z.number().positive('Variation price must be a positive number'),
  stock_quantity: z.number().int().min(0, 'Variation stock quantity must be a non-negative integer'),
  low_stock_threshold: z.number().int().min(0, 'Low stock threshold must be a non-negative integer').optional(), // Add low_stock_threshold
});

const createProductSchema = z.object({
  name: z.string().trim().nonempty('Product name is required'),
  branch_id: z.number().int().positive('A valid branch ID is required'),
  sku: z.string().trim().nonempty('SKU is required'),
  product_type: z.string().trim().nonempty('Product type is required'),
  variations: z.array(variationSchema).min(1, 'Product must have at least one variation'),
});

const updateProductSchema = z.object({
  name: z.string().trim().nonempty('Product name cannot be empty').optional(),
  branch_id: z.number().int().positive('A valid branch ID is required').optional(),
  variations: z.array(variationSchema).optional(),
});

// Validation Middleware
const validate = (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
    }
    next(error);
  }
};

const createProductRouter = () => {
  const router = Router();

  router.get(
    '/',
    authMiddleware.authenticate,
    authMiddleware.authorize('read', 'product'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const products = await productService.getAllProducts();
        res.status(200).json(products);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.authorize('create', 'product'),
    validate(createProductSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json(newProduct);
        // Audit Log
        auditService.recordAuditLog({
          userId: (req as any).user?.id,
          action: 'CREATE',
          entityType: 'product',
          entityId: newProduct.id,
          details: newProduct,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize('read', 'product'),
    async (req: Request, res: Response, next: NextFunction) => {
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
    },
  );

  router.get(
    '/:productId/variations/:variationId/price-history',
    authMiddleware.authenticate,
    authMiddleware.authorize('read', 'product'), // Assuming price history is part of product read permission
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

  router.put(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize('update', 'product'),
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
          // Audit Log
          auditService.recordAuditLog({
            userId: (req as any).user?.id,
            action: 'UPDATE',
            entityType: 'product',
            entityId: updatedProduct ? (updatedProduct.id as number) : undefined,
            details: { oldData: req.body, newData: updatedProduct }, // You might want to fetch old data for a more complete log
          });
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
    authMiddleware.authenticate,
    authMiddleware.authorize('delete', 'product'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          throw new NotFoundError('Invalid product ID');
        }
        const deleted = await productService.deleteProduct(id) as boolean;

        if (deleted) {
          res.status(204).send();
          // Audit Log
          auditService.recordAuditLog({
            userId: (req as any).user?.id,
            action: 'DELETE',
            entityType: 'product',
            entityId: id,
            details: { productId: id },
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
