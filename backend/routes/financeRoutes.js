const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const financeController = require('../controllers/financeController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Middleware de autenticação para todas as rotas financeiras
router.use(authenticateToken);

// Rota para o dashboard financeiro
router.get(
  '/dashboard',
  authorize('reports:view:financial'), // Apenas usuários com permissão podem ver relatórios financeiros
  [
    query('startDate').isISO8601().withMessage('Data de início inválida.'),
    query('endDate').isISO8601().withMessage('Data de fim inválida.')
  ],
  validate,
  financeController.getDashboardData
);

module.exports = router;