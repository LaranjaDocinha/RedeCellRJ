const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const financeController = require('../controllers/financeController');

// Rota para obter o resumo financeiro
router.get('/summary', [authenticateToken, authorize('reports:view:financial')], financeController.getFinancialSummary);

// Rotas para Despesas
router.get('/expenses', [authenticateToken, authorize('expenses:read')], financeController.getAllExpenses);
router.get('/expenses/:id', [authenticateToken, authorize('expenses:read')], financeController.getExpenseById);
router.post('/expenses', [authenticateToken, authorize('expenses:create')], financeController.createExpense);
router.put('/expenses/:id', [authenticateToken, authorize('expenses:update')], financeController.updateExpense);
router.delete('/expenses/:id', [authenticateToken, authorize('expenses:delete')], financeController.deleteExpense);

// Rota para obter dados do dashboard financeiro
router.get('/dashboard', [authenticateToken, authorize('reports:view:financial')], financeController.getFinanceDashboardData);

module.exports = router;
