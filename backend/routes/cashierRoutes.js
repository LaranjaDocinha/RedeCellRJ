const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const cashierController = require('../controllers/cashierController');

// Abre o caixa
router.post('/open', [authenticateToken, authorize('sales:create')], cashierController.openCashier);

// Fecha o caixa
router.post('/close', [authenticateToken, authorize('sales:create')], cashierController.closeCashier);

// Obtém o status do caixa
router.get('/status', [authenticateToken, authorize('sales:read')], cashierController.getCashierStatus);

// Obtém o resumo do caixa atual
router.get('/summary', [authenticateToken, authorize('sales:read')], cashierController.getCashierSummary);

module.exports = router;