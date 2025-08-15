const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const bankAccountController = require('../controllers/bankAccountController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Regras de validação para criação e atualização de conta
const accountValidationRules = () => [
  body('name').notEmpty().withMessage('O nome da conta é obrigatório.').trim(),
  body('bank_name').notEmpty().withMessage('O nome do banco é obrigatório.').trim(),
  body('account_number').notEmpty().withMessage('O número da conta é obrigatório.').trim(),
  body('initial_balance').isFloat().withMessage('O saldo inicial deve ser um número.')
];

// Proteger todas as rotas
router.use(authenticateToken);

// Rotas CRUD para Contas Bancárias
router.get('/', 
  authorize('reports:view:financial'), 
  bankAccountController.getAllBankAccounts
);

router.post('/', 
  authorize('finance:manage'), 
  accountValidationRules(), 
  validate, 
  bankAccountController.createBankAccount
);

router.get('/:id', 
  authorize('reports:view:financial'), 
  param('id').isInt(), 
  validate, 
  bankAccountController.getBankAccountById
);

router.put('/:id', 
  authorize('finance:manage'), 
  param('id').isInt(), 
  accountValidationRules(), 
  validate, 
  bankAccountController.updateBankAccount
);

router.delete('/:id', 
  authorize('finance:manage'), 
  param('id').isInt(), 
  validate, 
  bankAccountController.deleteBankAccount
);

module.exports = router;
