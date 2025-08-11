const express = require('express');
const router = express.Router();
const db = require('../db'); // Importar a conexão com o banco de dados
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

// Obter todas as configurações
router.get('/', [authenticateToken, authorize('settings:manage')], settingsController.getAllSettings);

// Atualizar uma configuração
router.put('/:name', [authenticateToken, authorize('settings:manage')], settingsController.updateSetting);

// Obter logs de auditoria
router.get('/audit-logs', [authenticateToken, authorize('audit_logs:read')], settingsController.getAuditLogs);

module.exports = router;