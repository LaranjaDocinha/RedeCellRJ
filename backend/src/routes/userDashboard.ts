import { Router, Request, Response, NextFunction } from 'express';
import * as userDashboardService from '../services/userDashboardService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

const router = Router();

// Middleware to ensure user is authenticated and has a user ID
router.use(authMiddleware.authenticate);

// Zod Schema for user dashboard settings
const updateSettingsSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  notifications: z.boolean().optional(),
  // Add other settings fields as they are defined in the user dashboard settings
}).partial(); // .partial() makes all fields optional, allowing for partial updates

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

router.get('/settings',
  authMiddleware.authorize('read', 'UserDashboard'),
  async (req, res, next) => {
  try {
    const userId = (req as any).user.id; // Assuming user ID is attached by authMiddleware
    const settings = await userDashboardService.getSettings(userId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/settings',
  authMiddleware.authorize('update', 'UserDashboard'),
  validate(updateSettingsSchema),
  async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const newSettings = req.body;
    const updatedSettings = await userDashboardService.updateSettings(userId, newSettings);
    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
});

export default router;
