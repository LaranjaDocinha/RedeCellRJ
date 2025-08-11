const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Rota para obter dados do dashboard principal
router.get('/', [authenticateToken, authorize('reports:view:operational')], dashboardController.getDashboardData);

// Rota para obter resumo do dashboard
router.get('/summary', [authenticateToken, authorize('reports:view:financial')], dashboardController.getDashboardSummary);

// Rota para obter visão geral de vendas por período (para gráficos)
router.get('/sales-overview', [authenticateToken, authorize('reports:view:financial')], dashboardController.getSalesOverview);

module.exports = router;
