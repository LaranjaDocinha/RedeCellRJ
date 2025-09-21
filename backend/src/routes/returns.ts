import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { returnService } from '../services/returnService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const returnsRouter = Router();

// Zod Schemas
const createReturnItemSchema = z.object({
  product_id: z.number().int().positive('Product ID must be a positive integer'),
  variation_id: z.number().int().positive('Variation ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

const createReturnSchema = z.object({
  sale_id: z.number().int().positive('Sale ID must be a positive integer'),
  reason: z.string().trim().optional(),
  items: z.array(createReturnItemSchema).min(1, 'At least one item must be returned'),
});

const updateReturnSchema = z.object({
  reason: z.string().trim().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed'], { message: 'Invalid return status' }).optional(),
  refund_amount: z.number().positive('Refund amount must be a positive number').optional(),
}).partial();

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

returnsRouter.use(authMiddleware.authenticate);
returnsRouter.use(authMiddleware.authorize('manage', 'Returns')); // Only users with manage:Returns permission can access these routes

// Get all returns
returnsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const returns = await returnService.getAllReturns();
      res.status(200).json(returns);
    } catch (error) {
      next(error);
    }
  }
);

// Get return by ID
returnsRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const returnRecord = await returnService.getReturnById(parseInt(req.params.id));
      if (!returnRecord) {
        throw new AppError('Return not found', 404);
      }
      res.status(200).json(returnRecord);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new return
returnsRouter.post(
  '/',
  validate(createReturnSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newReturn = await returnService.createReturn(req.body);
      res.status(201).json(newReturn);
    } catch (error) {
      next(error);
    }
  }
);

// Update a return by ID
returnsRouter.put(
  '/:id',
  validate(updateReturnSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedReturn = await returnService.updateReturn(parseInt(req.params.id), req.body);
      if (!updatedReturn) {
        throw new AppError('Return not found', 404);
      }
      res.status(200).json(updatedReturn);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a return by ID
returnsRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await returnService.deleteReturn(parseInt(req.params.id));
      if (!deleted) {
        throw new AppError('Return not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default returnsRouter;