import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { settingsService } from '../services/settingsService.js';
import { featureFlagService } from '../services/featureFlagService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const settingsRouter = Router();

// Validation Middleware - Defined BEFORE usage
const validate =
  (schema: z.ZodObject<any, any, any> | z.ZodEffects<any, any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
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

// Zod Schemas
const createSettingSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  group: z.string().optional(),
});

const updateSettingSchema = z.object({
  value: z.any(),
  group: z.string().optional(),
});

settingsRouter.use(authMiddleware.authenticate);

// Get all feature flags
settingsRouter.get('/flags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await featureFlagService.getAllFlags();
    res.status(200).json(flags);
  } catch (error) {
    next(error);
  }
});

// Toggle feature flag
settingsRouter.post(
  '/flags/:name/toggle',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.params;
      const { isEnabled } = req.body;
      await featureFlagService.toggleFlag(name, isEnabled);
      res.status(200).json({ message: `Flag ${name} updated to ${isEnabled}` });
    } catch (error) {
      next(error);
    }
  },
);

settingsRouter.use(authMiddleware.authorize('manage', 'Settings'));

// Get all settings
settingsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getAllSettings();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
});

// Get setting by key
settingsRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingsService.getSettingByKey(req.params.key);
    if (!setting) {
      throw new AppError('Setting not found', 404);
    }
    res.status(200).json(setting);
  } catch (error) {
    next(error);
  }
});

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
  },
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
  },
);

// Delete a setting by key
settingsRouter.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await settingsService.deleteSetting(req.params.key);
    if (!deleted) {
      throw new AppError('Setting not found', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default settingsRouter;
