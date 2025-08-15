const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const quotationController = require('../controllers/quotationController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Regras de validação para criação e atualização de cotação
const quotationValidationRules = () => [
  body('customer_id').isInt().withMessage('ID do cliente é obrigatório.'),
  body('quotation_date').isISO8601().toDate().withMessage('Data da cotação é obrigatória.'),
  body('valid_until_date').isISO8601().toDate().withMessage('Data de validade é obrigatória.'),
  body('total_amount').isFloat({ gt: 0 }).withMessage('Valor total deve ser positivo.'),
  body('status').isIn(['Draft', 'Sent', 'Approved', 'Rejected', 'ConvertedToSale']).withMessage('Status inválido.'),
  body('notes').optional().trim(),
  body('items').isArray({ min: 1 }).withMessage('A cotação deve ter pelo menos um item.'),
  body('items.*.description').notEmpty().withMessage('A descrição do item é obrigatória.'),
  body('items.*.quantity').isInt({ gt: 0 }).withMessage('A quantidade do item deve ser um número inteiro positivo.'),
  body('items.*.unit_price').isFloat({ gt: 0 }).withMessage('O preço unitário do item deve ser um número positivo.'),
  body('items.*.subtotal').isFloat({ gt: 0 }).withMessage('O subtotal do item deve ser um número positivo.'),
];

// Proteger todas as rotas
router.use(authenticateToken);

// Rotas CRUD para Cotações
router.get('/', 
  authorize('sales:read'), 
  quotationController.getAllQuotations
);

router.post('/', 
  authorize('sales:create'), 
  quotationValidationRules(), 
  validate, 
  quotationController.createQuotation
);

router.get('/:id', 
  authorize('sales:read'), 
  param('id').isInt(), 
  validate, 
  quotationController.getQuotationById
);

router.put('/:id', 
  authorize('sales:create'), // Usando sales:create para update também, ou criar quotations:manage
  param('id').isInt(), 
  quotationValidationRules(), 
  validate, 
  quotationController.updateQuotation
);

router.delete('/:id', 
  authorize('sales:create'), // Usando sales:create para delete também
  param('id').isInt(), 
  validate, 
  quotationController.deleteQuotation
);

// Rota para gerar PDF (TODO)
router.get('/pdf/:id',
  authorize('sales:read'),
  param('id').isInt(),
  validate,
  quotationController.generateQuotationPdf
);

module.exports = router;