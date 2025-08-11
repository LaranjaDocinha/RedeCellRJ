const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const paymentMethodController = require('../controllers/paymentMethodController');

// Obter todos os métodos de pagamento
router.get('/', [authenticateToken, authorize('sales:read')], paymentMethodController.getAllPaymentMethods);

// Criar um novo método de pagamento
router.post('/', [authenticateToken, authorize('settings:manage')], paymentMethodController.createPaymentMethod);

// Atualizar um método de pagamento
router.put('/:id', [authenticateToken, authorize('settings:manage')], paymentMethodController.updatePaymentMethod);

// Deletar um método de pagamento
router.delete('/:id', [authenticateToken, authorize('settings:manage')], paymentMethodController.deletePaymentMethod);

module.exports = router;