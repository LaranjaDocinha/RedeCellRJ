const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const commissionRuleController = require('../controllers/commissionRuleController');

// Criar uma nova regra de comissão
router.post('/', [authenticateToken, authorize('commissions:manage_rules')], commissionRuleController.createCommissionRule);

// Obter todas as regras de comissão
router.get('/', [authenticateToken, authorize('commissions:read_rules')], commissionRuleController.getAllCommissionRules);

// Obter uma regra de comissão por ID
router.get('/:id', [authenticateToken, authorize('commissions:read_rules')], commissionRuleController.getCommissionRuleById);

// Atualizar uma regra de comissão
router.put('/:id', [authenticateToken, authorize('commissions:manage_rules')], commissionRuleController.updateCommissionRule);

// Deletar uma regra de comissão
router.delete('/:id', [authenticateToken, authorize('commissions:manage_rules')], commissionRuleController.deleteCommissionRule);

module.exports = router;