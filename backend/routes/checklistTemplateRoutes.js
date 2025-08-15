const express = require('express');
const router = express.Router();
const checklistTemplateController = require('../controllers/checklistTemplateController');
const { body } = require('express-validator'); // For validation

// Validation rules for creating and updating a checklist template
const checklistTemplateValidationRules = [
    body('name').notEmpty().withMessage('Nome do template é obrigatório.'),
    body('description').optional().isString().withMessage('Descrição deve ser uma string.'),
    body('category').optional().isString().withMessage('Categoria deve ser uma string.'),
];

// Create a new checklist template
router.post('/', checklistTemplateValidationRules, checklistTemplateController.createChecklistTemplate); // Add authenticateToken and authorize middleware later

// Get all checklist templates
router.get('/', checklistTemplateController.getAllChecklistTemplates); // Add authenticateToken and authorize middleware later

// Get a single checklist template by ID
router.get('/:id', checklistTemplateController.getChecklistTemplateById); // Add authenticateToken and authorize middleware later

// Update a checklist template
router.put('/:id', checklistTemplateValidationRules, checklistTemplateController.updateChecklistTemplate); // Add authenticateToken and authorize middleware later

// Delete a checklist template
router.delete('/:id', checklistTemplateController.deleteChecklistTemplate); // Add authenticateToken and authorize middleware later

module.exports = router;
