const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const bankReconciliationController = require('../controllers/bankReconciliationController');

// Rotas para obter transações internas não conciliadas
router.get('/unreconciled/sales', [authenticateToken, authorize('bank_reconciliation:read_internal_transactions')], bankReconciliationController.getUnreconciledSales);
router.get('/unreconciled/expenses', [authenticateToken, authorize('bank_reconciliation:read_internal_transactions')], bankReconciliationController.getUnreconciledExpenses);
router.get('/unreconciled/accounts-receivable', [authenticateToken, authorize('bank_reconciliation:read_internal_transactions')], bankReconciliationController.getUnreconciledAccountsReceivable);
router.get('/unreconciled/accounts-payable', [authenticateToken, authorize('bank_reconciliation:read_internal_transactions')], bankReconciliationController.getUnreconciledAccountsPayable);

// Rotas para Conciliação
router.patch('/transactions/:id/reconcile', [authenticateToken, authorize('bank_reconciliation:reconcile')], bankReconciliationController.reconcileTransaction);
router.patch('/transactions/:id/unreconcile', [authenticateToken, authorize('bank_reconciliation:reconcile')], bankReconciliationController.unreconcileTransaction);

// Rota para Conciliação Automática
router.post('/auto-reconcile', [authenticateToken, authorize('bank_reconciliation:reconcile')], bankReconciliationController.performAutomaticReconciliation);

// Rota para Relatório de Conciliação
router.get('/report', [authenticateToken, authorize('bank_reconciliation:read_report')], bankReconciliationController.getReconciliationReport);

module.exports = router;
