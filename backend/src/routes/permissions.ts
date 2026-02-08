import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { permissionService } from '../services/permissionService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import { ValidationError, AppError } from '../utils/errors.js';
import { sendSuccess } from '../utils/responseHelper.js';

const permissionsRouter = Router();

// Zod Schemas
const createPermissionSchema = z.object({
  action: z.string().trim().nonempty('Action is required'),
  subject: z.string().trim().nonempty('Subject is required'),
});

const updatePermissionSchema = z
  .object({
    action: z.string().trim().nonempty('Action cannot be empty').optional(),
    subject: z.string().trim().nonempty('Subject cannot be empty').optional(),
  })
  .partial();

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

permissionsRouter.use(authMiddleware.authenticate);
permissionsRouter.use(authMiddleware.authorize('manage', 'Permissions')); // Only users with manage:Permissions permission can access these routes

// Get all permissions
permissionsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    sendSuccess(res, permissions);
  } catch (error) {
    next(error);
  }
});

// Get permission by ID
permissionsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permission = await permissionService.getPermissionById(parseInt(req.params.id));
    if (!permission) {
      throw new AppError('Permission not found', 404);
    }
    sendSuccess(res, permission);
  } catch (error) {
    next(error);
  }
});

// Create a new permission
permissionsRouter.post(
  '/',
  validate(createPermissionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPermission = await permissionService.createPermission(req.body);
      sendSuccess(res, newPermission, 201);
    } catch (error) {
      next(error);
    }
  },
);

// Update a permission by ID
permissionsRouter.put(
  '/:id',
  validate(updatePermissionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedPermission = await permissionService.updatePermission(
        parseInt(req.params.id),
        req.body,
      );
      if (!updatedPermission) {
        throw new AppError('Permission not found', 404);
      }
      sendSuccess(res, updatedPermission);
    } catch (error) {
      next(error);
    }
  },
);

// Delete a permission by ID
permissionsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await permissionService.deletePermission(parseInt(req.params.id));
    if (!deleted) {
      throw new AppError('Permission not found', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default permissionsRouter;
