import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { loyaltyService } from '../services/loyaltyService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import { ValidationError } from '../utils/errors.js';

const router = Router();

router.use(authMiddleware.authenticate);

// Zod Schemas
const pointsSchema = z.object({
  points: z.number().int().positive('Points must be a positive integer'),
  reason: z.string().nonempty('Reason is required'),
});

// Validation Middleware
const validate =
  (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            'Validation failed',
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

router.get(
  '/points',
  authMiddleware.authorize('read', 'Loyalty'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const points = await loyaltyService.getLoyaltyPoints(userId);
      res.json({ loyalty_points: points });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/add-points',
  authMiddleware.authorize('create', 'Loyalty'),
  validate(pointsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, points, reason } = req.body; // Admin/Manager can add points to any user
      const newPoints = await loyaltyService.addLoyaltyPoints(userId, points, reason);
      res.status(200).json({ loyalty_points: newPoints });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/redeem-points',
  authMiddleware.authorize('update', 'Loyalty'),
  validate(pointsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id; // User redeems their own points
      const { points, reason } = req.body;
      const newPoints = await loyaltyService.redeemLoyaltyPoints(userId, points, reason);
      res.status(200).json({ loyalty_points: newPoints });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/transactions',
  authMiddleware.authorize('read', 'Loyalty'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const transactions = await loyaltyService.getLoyaltyTransactions(userId);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
