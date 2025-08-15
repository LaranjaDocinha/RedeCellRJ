const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { body } = require('express-validator'); // For validation

// Validation rules for creating and updating a lead
const leadValidationRules = [
    body('name').notEmpty().withMessage('Nome do lead é obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.').optional({ nullable: true, checkFalsy: true }),
    body('phone').notEmpty().withMessage('Telefone do lead é obrigatório.'),
    body('source').notEmpty().withMessage('Fonte do lead é obrigatória.'),
    body('status').isIn(['Novo', 'Qualificado', 'Contato', 'Convertido', 'Perdido']).withMessage('Status do lead inválido.'),
];

// Create a new lead
router.post('/', leadValidationRules, leadController.createLead); // Add authenticateToken and authorize middleware later

// Get all leads
router.get('/', leadController.getAllLeads); // Add authenticateToken and authorize middleware later

// Get a single lead by ID
router.get('/:id', leadController.getLeadById); // Add authenticateToken and authorize middleware later

// Update a lead
router.put('/:id', leadValidationRules, leadController.updateLead); // Add authenticateToken and authorize middleware later

// Delete a lead
router.delete('/:id', leadController.deleteLead); // Add authenticateToken and authorize middleware later

// Convert a lead (placeholder route)
router.post('/:id/convert', leadController.convertLead); // Add authenticateToken and authorize middleware later

module.exports = router;
