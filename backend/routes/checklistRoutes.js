const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const checklistController = require('../controllers/checklistController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Proteger todas as rotas
router.use(authenticateToken);

// Rotas CRUD para Templates de Checklist
router.get('/templates', 
  authorize('repairs:read'), 
  checklistController.getAllTemplates
);

router.post('/templates', 
  authorize('repairs:manage'), 
  [
    body('name').notEmpty().withMessage('O nome do template é obrigatório.').trim(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('items').isArray().withMessage('Itens devem ser um array.'),
    body('items.*.item_text').notEmpty().withMessage('O texto do item é obrigatório.'),
    body('items.*.response_type').isIn(['boolean', 'text']).withMessage('Tipo de resposta inválido.'),
  ],
  validate,
  checklistController.createTemplate
);

router.get('/templates/:id', 
  authorize('repairs:read'), 
  param('id').isInt(), 
  validate, 
  checklistController.getTemplateById
);

router.put('/templates/:id', 
  authorize('repairs:manage'), 
  param('id').isInt(), 
  [
    body('name').notEmpty().withMessage('O nome do template é obrigatório.').trim(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('items').isArray().withMessage('Itens devem ser um array.'),
    body('items.*.item_text').notEmpty().withMessage('O texto do item é obrigatório.'),
    body('items.*.response_type').isIn(['boolean', 'text']).withMessage('Tipo de resposta inválido.'),
  ],
  validate,
  checklistController.updateTemplate
);

router.delete('/templates/:id', 
  authorize('repairs:manage'), 
  param('id').isInt(), 
  validate, 
  checklistController.deleteTemplate
);

module.exports = router;