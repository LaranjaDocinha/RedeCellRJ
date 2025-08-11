const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const cashFlowController = require('../controllers/cashFlowController');

// Criar uma nova projeção de fluxo de caixa
router.post('/projections', [authenticateToken, authorize('cash_flow:manage')], cashFlowController.createCashFlowProjection);

// Obter todas as projeções de fluxo de caixa
router.get('/projections', [authenticateToken, authorize('cash_flow:read')], cashFlowController.getAllCashFlowProjections);

// Obter uma projeção de fluxo de caixa por ID
router.get('/projections/:id', [authenticateToken, authorize('cash_flow:read')], cashFlowController.getCashFlowProjectionById);

// Atualizar uma projeção de fluxo de caixa
router.put('/projections/:id', [authenticateToken, authorize('cash_flow:manage')], cashFlowController.updateCashFlowProjection);

// Deletar uma projeção de fluxo de caixa
router.delete('/projections/:id', [authenticateToken, authorize('cash_flow:manage')], cashFlowController.deleteCashFlowProjection);

// Gerar relatório de fluxo de caixa (Previsto vs. Realizado)
router.get('/report', [authenticateToken, authorize('cash_flow:read_report')], cashFlowController.getCashFlowReport);

// Gerar relatório de fluxo de caixa por categoria
router.get('/report/category', [authenticateToken, authorize('cash_flow:read_report')], cashFlowController.getCashFlowReportByCategory);

module.exports = router;
