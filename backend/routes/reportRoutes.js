const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// Rota para gerar relatório de vendas
router.get('/sales', [authenticateToken, authorize('reports:view:financial')], reportController.getSalesReport);

// Rota para gerar relatório de estoque
router.get('/inventory', [authenticateToken, authorize('reports:view:operational')], reportController.getInventoryReport);

// Rota para gerar relatório de lucratividade
router.get('/profitability', [authenticateToken, authorize('reports:view:financial')], reportController.getProfitabilityReport);

// Rota para exportação contábil
router.get('/accounting-export', [authenticateToken, authorize('reports:export:financial')], reportController.getAccountingExport);

// Rota para gerar relatório de vendas por categoria
router.get('/sales-by-category', [authenticateToken, authorize('reports:view:financial')], reportController.getSalesByCategoryReport);

// Rota para gerar relatório de produtos com estoque baixo
router.get('/low-stock-products', [authenticateToken, authorize('reports:view:operational')], reportController.getLowStockProductsReport);

// Rota para gerar relatório de desempenho por técnico
router.get('/technician-performance', [authenticateToken, authorize('reports:view:operational')], reportController.getTechnicianPerformanceReport);

// Rota para gerar análise ABC de produtos
router.get('/abc-products', [authenticateToken, authorize('reports:view:operational')], reportController.getAbcProductAnalysis);

// Rota para gerar análise ABC de clientes
router.get('/abc-customers', [authenticateToken, authorize('reports:view:operational')], reportController.getAbcCustomerAnalysis);

// Rota para obter métricas do Kanban
router.get('/kanban', [authenticateToken, authorize('reports:view:operational')], reportController.getKanbanMetrics);

// Rota para gerar relatório de lucratividade por produto detalhado
router.get('/product-profitability', [authenticateToken, authorize('reports:view:financial')], reportController.getProductProfitabilityReport);

// Rota para obter logs de auditoria
router.get('/audit-logs', [authenticateToken, authorize('reports:view:admin')], reportController.getAuditLogs);

module.exports = router;
