import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { loyaltyService } from '../services/loyaltyService.js'; // Reusing loyaltyService for tier management
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const loyaltyTiersRouter = Router();

// Zod Schemas
const createLoyaltyTierSchema = z.object({
  name: z.string().trim().nonempty('Tier name is required'),
  min_points: z.number().int().min(0, 'Minimum points must be a non-negative integer'),
  description: z.string().trim().optional(),
  benefits: z.record(z.any()).optional(), // Flexible JSONB for benefits
});

const updateLoyaltyTierSchema = z.object({
  name: z.string().trim().nonempty('Tier name cannot be empty').optional(),
  min_points: z.number().int().min(0, 'Minimum points must be a non-negative integer').optional(),
  description: z.string().trim().optional(),
  benefits: z.record(z.any()).optional(),
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

loyaltyTiersRouter.use(authMiddleware.authenticate);
loyaltyTiersRouter.use(authMiddleware.authorize('manage', 'LoyaltyTiers')); // New permission for managing tiers

// Get all loyalty tiers
loyaltyTiersRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tiers = await loyaltyService.getAllLoyaltyTiers();
      res.status(200).json(tiers);
    } catch (error) {
      next(error);
    }
  }
);

// Get loyalty tier by ID
loyaltyTiersRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tier = await loyaltyService.getLoyaltyTierById(parseInt(req.params.id));
      if (!tier) {
        throw new AppError('Loyalty tier not found', 404);
      }
      res.status(200).json(tier);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new loyalty tier
loyaltyTiersRouter.post(
  '/',
  validate(createLoyaltyTierSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newTier = await loyaltyService.createLoyaltyTier(req.body);
      res.status(201).json(newTier);
    } catch (error) {
      next(error);
    }
  }
);

// Update a loyalty tier by ID
loyaltyTiersRouter.put(
  '/:id',
  validate(updateLoyaltyTierSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedTier = await loyaltyService.updateLoyaltyTier(parseInt(req.params.id), req.body);
      if (!updatedTier) {
        throw new AppError('Loyalty tier not found', 404);
      }
      res.status(200).json(updatedTier);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a loyalty tier by ID
loyaltyTiersRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await loyaltyService.deleteLoyaltyTier(parseInt(req.params.id));
      if (!deleted) {
        throw new AppError('Loyalty tier not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default loyaltyTiersRouter;