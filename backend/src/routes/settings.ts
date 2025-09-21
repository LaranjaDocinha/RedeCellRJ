import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { settingsService } from '../services/settingsService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const settingsRouter = Router();

// Zod Schemas
const createSettingSchema = z.object({
  key: z.string().trim().nonempty('Setting key is required'),
  value: z.string().nonempty('Setting value is required'),
  description: z.string().trim().optional(),
});

const updateSettingSchema = z.object({
  value: z.string().nonempty('Setting value is required').optional(),
  description: z.string().trim().optional(),
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

settingsRouter.use(authMiddleware.authenticate);
settingsRouter.use(authMiddleware.authorize('manage', 'Settings')); // Only users with manage:Settings permission can access these routes

// Get all settings
settingsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await settingsService.getAllSettings();
      res.status(200).json(settings);
    } catch (error) {
      next(error);
    }
  }
);

// Get setting by key
settingsRouter.get(
  '/:key',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const setting = await settingsService.getSettingByKey(req.params.key);
      if (!setting) {
        throw new AppError('Setting not found', 404);
      }
      res.status(200).json(setting);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new setting
settingsRouter.post(
  '/',
  validate(createSettingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newSetting = await settingsService.createSetting(req.body);
      res.status(201).json(newSetting);
    } catch (error) {
      next(error);
    }
  }
);

// Update a setting by key
settingsRouter.put(
  '/:key',
  validate(updateSettingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedSetting = await settingsService.updateSetting(req.params.key, req.body);
      if (!updatedSetting) {
        throw new AppError('Setting not found', 404);
      }
      res.status(200).json(updatedSetting);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a setting by key
settingsRouter.delete(
  '/:key',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await settingsService.deleteSetting(req.params.key);
      if (!deleted) {
        throw new AppError('Setting not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default settingsRouter;