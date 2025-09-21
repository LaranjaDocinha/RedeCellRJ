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
import { roleService } from '../services/roleService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const rolesRouter = Router();
// Zod Schemas
const createRoleSchema = z.object({
    name: z.string().trim().nonempty('Role name is required'),
});
const updateRoleSchema = z.object({
    name: z.string().trim().nonempty('Role name cannot be empty').optional(),
}).partial();
const assignPermissionSchema = z.object({
    permissionId: z.number().int().positive('Permission ID must be a positive integer'),
});
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
rolesRouter.use(authMiddleware.authenticate);
rolesRouter.use(authMiddleware.authorize('manage', 'Roles')); // Only users with manage:Roles permission can access these routes
// Get all roles
rolesRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield roleService.getAllRoles();
        res.status(200).json(roles);
    }
    catch (error) {
        next(error);
    }
}));
// Get role by ID
rolesRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield roleService.getRoleById(parseInt(req.params.id));
        if (!role) {
            throw new AppError('Role not found', 404);
        }
        res.status(200).json(role);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new role
rolesRouter.post('/', validate(createRoleSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newRole = yield roleService.createRole(req.body);
        res.status(201).json(newRole);
    }
    catch (error) {
        next(error);
    }
}));
// Update a role by ID
rolesRouter.put('/:id', validate(updateRoleSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedRole = yield roleService.updateRole(parseInt(req.params.id), req.body);
        if (!updatedRole) {
            throw new AppError('Role not found', 404);
        }
        res.status(200).json(updatedRole);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a role by ID
rolesRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield roleService.deleteRole(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Role not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
// Assign permission to role
rolesRouter.post('/:roleId/permissions', validate(assignPermissionSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleId = parseInt(req.params.roleId);
        const { permissionId } = req.body;
        yield roleService.assignPermissionToRole(roleId, permissionId);
        res.status(200).json({ message: 'Permission assigned successfully' });
    }
    catch (error) {
        next(error);
    }
}));
// Remove permission from role
rolesRouter.delete('/:roleId/permissions/:permissionId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleId = parseInt(req.params.roleId);
        const permissionId = parseInt(req.params.permissionId);
        yield roleService.removePermissionFromRole(roleId, permissionId);
        res.status(200).json({ message: 'Permission removed successfully' });
    }
    catch (error) {
        next(error);
    }
}));
export default rolesRouter;
