import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { saleService } from '../services/saleService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const salesRouter = Router();

// Zod Schemas
const saleItemSchema = z.object({
  product_id: z.number().int().positive('Product ID must be a positive integer'),
  variation_id: z.number().int().positive('Variation ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, 'Items array cannot be empty'),
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



salesRouter.post(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Sale'),
  validate(createSaleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body;
      const userId = (req as any).user ? (req as any).user.id : null; // Get user ID from authenticated request
      const newSale = await saleService.createSale(userId, items);
      res.status(201).json(newSale);
    } catch (error) {
      next(error);
    }
  }
);

salesRouter.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Sale'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sales = await saleService.getAllSales();
      res.status(200).json(sales);
    } catch (error) {
      next(error);
    }
  }
);

salesRouter.get(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Sale'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sale = await saleService.getSaleById(parseInt(req.params.id));
      if (!sale) {
        throw new AppError('Sale not found', 404);
      }
      res.status(200).json(sale);
    } catch (error) {
      next(error);
    }
  }
);

export { salesRouter };