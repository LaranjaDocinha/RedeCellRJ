const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const salesController = require('../controllers/salesController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Proteger todas as rotas
router.use(authenticateToken);

// Criar uma nova venda
router.post('/', 
  authorize('sales:create'), 
  // Adicionar validação de body aqui se necessário
  salesController.createSale
);

// Obter todas as vendas (inclui histórico e filtros)
router.get('/', 
  authorize('sales:read'), 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo.'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limite deve ser um número inteiro positivo.'),
    query('sort').optional().isString().withMessage('Ordenação inválida.'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Ordem inválida.'),
    query('customer_id').optional().isInt().withMessage('ID do cliente inválido.'),
    query('startDate').optional().isISO8601().toDate().withMessage('Data de início inválida.'),
    query('endDate').optional().isISO8601().toDate().withMessage('Data de fim inválida.'),
    query('payment_method').optional().isString().withMessage('Método de pagamento inválido.'),
    query('search').optional().isString().withMessage('Termo de busca inválido.'),
  ],
  validate,
  salesController.getAllSales
);

// Obter uma venda por ID
router.get('/:id', 
  authorize('sales:read'), 
  param('id').isInt(), 
  validate, 
  salesController.getSaleById
);

module.exports = router;
