import { Router } from 'express';
import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  getPermissions,
  assignPermissionToRole,
  removePermissionFromRole,
} from '../controllers/rolePermissionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Role management
router.post(
  '/roles',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'RolePermission'),
  createRole,
);
router.get(
  '/roles',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'RolePermission'),
  getRoles,
);
router.put(
  '/roles/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'RolePermission'),
  updateRole,
);
router.delete(
  '/roles/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('delete', 'RolePermission'),
  deleteRole,
);

// Permission management (read-only for now)
router.get(
  '/permissions',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Permission'),
  getPermissions,
);

// Role-Permission assignment
router.post(
  '/role-permissions',
  authMiddleware.authenticate,
  authMiddleware.authorize('assign', 'RolePermission'),
  assignPermissionToRole,
);
router.delete(
  '/role-permissions',
  authMiddleware.authenticate,
  authMiddleware.authorize('remove', 'RolePermission'),
  removePermissionFromRole,
);

export default router;
