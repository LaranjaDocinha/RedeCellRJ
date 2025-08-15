
const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getAllSettings);

router.put('/:name', [authenticateToken, authorize('settings:manage')], settingsController.updateSetting);

router.get('/logs', [authenticateToken, authorize('settings_logs:read')], settingsController.getSettingsLogs);

router.get('/audit-logs', [authenticateToken, authorize('audit_logs:read')], settingsController.getAuditLogs);

module.exports = router;
