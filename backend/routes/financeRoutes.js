const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Contas a Pagar
router.get('/payables', financeController.getAllPayables);
router.post('/payables', financeController.createPayable);
router.put('/payables/:id', financeController.updatePayable);
router.delete('/payables/:id', financeController.deletePayable);

// Contas a Receber
router.get('/receivables', financeController.getAllReceivables);
router.post('/receivables', financeController.createReceivable);
router.put('/receivables/:id', financeController.updateReceivable);
router.delete('/receivables/:id', financeController.deleteReceivable);

module.exports = router;