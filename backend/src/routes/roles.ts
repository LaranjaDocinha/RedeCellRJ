import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { roleService } from '../services/roleService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import { ValidationError, AppError } from '../utils/errors.js';
import { sendSuccess } from '../utils/responseHelper.js';

const rolesRouter = Router();

// Zod Schemas
const createRoleSchema = z.object({
  name: z.string().trim().nonempty('Role name is required'),
  permissionIds: z.array(z.number().int().positive()).optional(), // Adicionado para criação
});

const updateRoleSchema = z
  .object({
    name: z.string().trim().nonempty('Role name cannot be empty').optional(),
    permissionIds: z.array(z.number().int().positive()).optional(), // Adicionado para atualização
  })
  .partial();

const assignPermissionSchema = z.object({
  permissionId: z.number().int().positive('Permission ID must be a positive integer'),
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

rolesRouter.use(authMiddleware.authenticate);
rolesRouter.use(authMiddleware.authorize('manage', 'Roles')); // Only users with manage:Roles permission can access these routes

// Get all roles
rolesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await roleService.getAllRoles();
    sendSuccess(res, roles);
  } catch (error) {
    next(error);
  }
});

// Get role by ID
rolesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.getRoleById(parseInt(req.params.id));
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    sendSuccess(res, role);
  } catch (error) {
    next(error);
  }
});

// Create a new role
rolesRouter.post(
  '/',
  validate(createRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newRole = await roleService.createRole(req.body);
      sendSuccess(res, { ...newRole, message: 'Role created successfully' }, 201);
    } catch (error) {
      next(error);
    }
  },
);

// Update a role by ID
rolesRouter.put(
  '/:id',
  validate(updateRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedRole = await roleService.updateRole(parseInt(req.params.id), req.body);
      if (!updatedRole) {
        throw new AppError('Role not found', 404);
      }
      sendSuccess(res, { ...updatedRole, message: 'Role updated successfully' });
    } catch (error) {
      next(error);
    }
  },
);

// Delete a role by ID
rolesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await roleService.deleteRole(parseInt(req.params.id));
    if (!deleted) {
      throw new AppError('Role not found', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Assign permission to role
rolesRouter.post(
  '/:roleId/permissions',
  validate(assignPermissionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const { permissionId } = req.body;
      await roleService.assignPermissionToRole(roleId, permissionId);
      sendSuccess(res, { message: 'Permission assigned successfully' });
    } catch (error) {
      next(error);
    }
  },
);

// Remove permission from role
rolesRouter.delete(
  '/:roleId/permissions/:permissionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      await roleService.removePermissionFromRole(roleId, permissionId);
      sendSuccess(res, { message: 'Permission removed successfully' });
    } catch (error) {
      next(error);
    }
  },
);

export default rolesRouter;
