const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validação para criação e atualização de despesa
const expenseValidationRules = () => [
  body('description').notEmpty().withMessage('A descrição é obrigatória.').trim(),
  body('amount').isFloat({ gt: 0 }).withMessage('O valor deve ser um número positivo.'),
  body('expense_date').isISO8601().toDate().withMessage('A data da despesa é obrigatória e deve estar no formato AAAA-MM-DD.'),
  body('category').optional().trim(),
  body('payment_method').optional().trim(),
  body('notes').optional().trim()
];

// Proteger todas as rotas de despesas
router.use(authenticateToken);

// Rotas CRUD
router.get('/', authorize('expenses:read'), expenseController.getAllExpenses);

router.post('/', 
  authorize('expenses:create'), 
  expenseValidationRules(), 
  validate, 
  expenseController.createExpense
);

router.get('/:id', 
  authorize('expenses:read'), 
  param('id').isInt(), 
  validate, 
  expenseController.getExpenseById
);

router.put('/:id', 
  authorize('expenses:update'), 
  param('id').isInt(), 
  expenseValidationRules(), 
  validate, 
  expenseController.updateExpense
);

router.delete('/:id', 
  authorize('expenses:delete'), 
  param('id').isInt(), 
  validate, 
  expenseController.deleteExpense
);

module.exports = router;