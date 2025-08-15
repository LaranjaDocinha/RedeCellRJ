const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const cashFlowController = require('../controllers/cashFlowController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validação para criação e atualização de projeção
const projectionValidationRules = () => [
  body('description').notEmpty().withMessage('A descrição é obrigatória.').trim(),
  body('amount').isFloat({ gt: 0 }).withMessage('O valor deve ser um número positivo.'),
  body('type').isIn(['inflow', 'outflow']).withMessage('O tipo deve ser \'inflow\' ou \'outflow\'.'),
  body('projection_date').isISO8601().toDate().withMessage('A data da projeção é obrigatória.'),
  body('notes').optional().trim()
];

// Proteger todas as rotas
router.use(authenticateToken);

// Rotas para Projeções
router.get(
    '/projections',
    authorize('reports:view:financial'),
    cashFlowController.getAllProjections
);

router.post(
    '/projections',
    authorize('finance:manage'), // Permissão para gerenciar dados financeiros
    projectionValidationRules(),
    validate,
    cashFlowController.createProjection
);

router.put(
    '/projections/:id',
    authorize('finance:manage'),
    param('id').isInt(),
    projectionValidationRules(),
    validate,
    cashFlowController.updateProjection
);

router.delete(
    '/projections/:id',
    authorize('finance:manage'),
    param('id').isInt(),
    validate,
    cashFlowController.deleteProjection
);

// Rota para o Relatório de Fluxo de Caixa
router.get(
    '/report',
    authorize('reports:view:financial'),
    [
        query('startDate').isISO8601().withMessage('Data de início inválida.'),
        query('endDate').isISO8601().withMessage('Data de fim inválida.')
    ],
    validate,
    cashFlowController.getCashFlowReport
);

module.exports = router;