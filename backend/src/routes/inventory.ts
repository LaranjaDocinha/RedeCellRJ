import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { inventoryService } from '../services/inventoryService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';

const router = Router();

// Middleware to ensure user is authenticated
router.use(authMiddleware.authenticate);

// Zod Schemas
const adjustStockSchema = z.object({
  variationId: z.number().int().positive('Variation ID must be a positive integer'),
  quantityChange: z.number().int('Quantity change must be an integer').refine(val => val !== 0, 'Quantity change cannot be zero'),
});

const receiveDispatchStockSchema = z.object({
  variationId: z.number().int().positive('Variation ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
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

router.get('/low-stock',
  authMiddleware.authorize('read', 'Inventory'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : undefined;
      const lowStockProducts = await inventoryService.getLowStockProducts(threshold);
      res.json(lowStockProducts);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/adjust-stock',
  authMiddleware.authorize('update', 'Inventory'),
  validate(adjustStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variationId, quantityChange } = req.body;
      const updatedVariation = await inventoryService.adjustStock(variationId, quantityChange);
      res.json(updatedVariation);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/receive-stock',
  authMiddleware.authorize('update', 'Inventory'),
  validate(receiveDispatchStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variationId, quantity } = req.body;
      const updatedVariation = await inventoryService.receiveStock(variationId, quantity);
      res.json(updatedVariation);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/dispatch-stock',
  authMiddleware.authorize('update', 'Inventory'),
  validate(receiveDispatchStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variationId, quantity } = req.body;
      const updatedVariation = await inventoryService.dispatchStock(variationId, quantity);
      res.json(updatedVariation);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
