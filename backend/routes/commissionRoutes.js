const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const commissionController = require('../controllers/commissionController');

// Calcular comissão para um usuário em um período
router.get('/calculate', [authenticateToken, authorize('commissions:read')], commissionController.calculateCommission);

// Obter comissões calculadas para um usuário em um período
router.get('/calculated', [authenticateToken, authorize('commissions:read')], commissionController.getCalculatedCommissions);

// Registrar pagamento de comissão
router.post('/payouts', [authenticateToken, authorize('commissions:manage')], commissionController.recordCommissionPayout);

// Obter todos os pagamentos de comissão
router.get('/payouts', [authenticateToken, authorize('commissions:read')], commissionController.getAllCommissionPayouts);

// Obter um pagamento de comissão por ID
router.get('/payouts/:id', [authenticateToken, authorize('commissions:read')], commissionController.getCommissionPayoutById);

// Atualizar um pagamento de comissão
router.put('/payouts/:id', [authenticateToken, authorize('commissions:manage')], commissionController.updateCommissionPayout);

// Deletar um pagamento de comissão
router.delete('/payouts/:id', [authenticateToken, authorize('commissions:manage')], commissionController.deleteCommissionPayout);

module.exports = router;
