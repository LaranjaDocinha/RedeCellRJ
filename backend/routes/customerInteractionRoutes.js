const express = require('express');
const router = express.Router();
const customerInteractionController = require('../controllers/customerInteractionController');
const { body } = require('express-validator'); // For validation

// Validation rules for creating and updating a customer interaction
const customerInteractionValidationRules = [
    body('customer_id').isInt({ min: 1 }).withMessage('ID do cliente é obrigatório e deve ser um número inteiro.'),
    body('user_id').isInt({ min: 1 }).withMessage('ID do usuário é obrigatório e deve ser um número inteiro.'),
    body('interaction_type').notEmpty().withMessage('Tipo de interação é obrigatório.'),
    body('notes').notEmpty().withMessage('Notas da interação são obrigatórias.'),
];

// Create a new customer interaction
router.post('/', customerInteractionValidationRules, customerInteractionController.createCustomerInteraction); // Add authenticateToken and authorize middleware later

// Get all customer interactions (can be filtered by customer_id)
router.get('/', customerInteractionController.getAllCustomerInteractions); // Add authenticateToken and authorize middleware later

// Get a single customer interaction by ID
router.get('/:id', customerInteractionController.getCustomerInteractionById); // Add authenticateToken and authorize middleware later

// Update a customer interaction
router.put('/:id', customerInteractionValidationRules, customerInteractionController.updateCustomerInteraction); // Add authenticateToken and authorize middleware later

// Delete a customer interaction
router.delete('/:id', customerInteractionController.deleteCustomerInteraction); // Add authenticateToken and authorize middleware later

module.exports = router;