const express = require('express');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Rotas para Papéis (Roles)
router.get('/', [authenticateToken, authorize('roles:read')], roleController.getAllRoles);
router.get('/:id', [authenticateToken, authorize('roles:read')], roleController.getRoleById);
router.post('/', [authenticateToken, authorize('roles:create')], roleController.createRole);
router.put('/:id', [authenticateToken, authorize('roles:update')], roleController.updateRole);
router.delete('/:id', [authenticateToken, authorize('roles:delete')], roleController.deleteRole);

// Rotas para Permissões (Permissions)
router.get('/permissions', [authenticateToken, authorize('permissions:read')], roleController.getAllPermissions);
router.post('/:roleId/permissions', [authenticateToken, authorize('roles:assign_permissions')], roleController.assignPermissionsToRole);
router.delete('/:roleId/permissions/:permissionId', [authenticateToken, authorize('roles:remove_permissions')], roleController.removePermissionFromRole);

module.exports = router;
