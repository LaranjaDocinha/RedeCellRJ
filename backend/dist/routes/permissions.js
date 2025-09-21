var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { z } from 'zod';
import { permissionService } from '../services/permissionService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const permissionsRouter = Router();
// Zod Schemas
const createPermissionSchema = z.object({
    name: z.string().trim().nonempty('Permission name is required'),
});
const updatePermissionSchema = z.object({
    name: z.string().trim().nonempty('Permission name cannot be empty').optional(),
}).partial();
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
permissionsRouter.use(authMiddleware.authenticate);
permissionsRouter.use(authMiddleware.authorize('manage', 'Permissions')); // Only users with manage:Permissions permission can access these routes
// Get all permissions
permissionsRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissions = yield permissionService.getAllPermissions();
        res.status(200).json(permissions);
    }
    catch (error) {
        next(error);
    }
}));
// Get permission by ID
permissionsRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permission = yield permissionService.getPermissionById(parseInt(req.params.id));
        if (!permission) {
            throw new AppError('Permission not found', 404);
        }
        res.status(200).json(permission);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new permission
permissionsRouter.post('/', validate(createPermissionSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPermission = yield permissionService.createPermission(req.body);
        res.status(201).json(newPermission);
    }
    catch (error) {
        next(error);
    }
}));
// Update a permission by ID
permissionsRouter.put('/:id', validate(updatePermissionSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedPermission = yield permissionService.updatePermission(parseInt(req.params.id), req.body);
        if (!updatedPermission) {
            throw new AppError('Permission not found', 404);
        }
        res.status(200).json(updatedPermission);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a permission by ID
permissionsRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield permissionService.deletePermission(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Permission not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default permissionsRouter;
