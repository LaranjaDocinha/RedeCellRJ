const express = require('express');
const router = express.Router();
const npsController = require('../controllers/npsController');
const { body, query } = require('express-validator'); // For validation

// Validation rules for creating and updating an NPS survey
const npsSurveyValidationRules = [
    body('customer_id').isInt({ min: 1 }).withMessage('ID do cliente é obrigatório e deve ser um número inteiro.'),
    body('score').isInt({ min: 0, max: 10 }).withMessage('Pontuação NPS é obrigatória e deve ser entre 0 e 10.'),
    body('feedback_text').optional().isString().withMessage('Feedback deve ser uma string.'),
    body('source').notEmpty().withMessage('Origem da pesquisa é obrigatória.'),
    body('related_sale_id').optional({ nullable: true }).isInt().withMessage('ID da venda relacionada deve ser um número inteiro.'),
    body('related_repair_id').optional({ nullable: true }).isInt().withMessage('ID do reparo relacionado deve ser um número inteiro.'),
];

// Create a new NPS survey response
router.post('/', npsSurveyValidationRules, npsController.createNpsSurvey); // Add authenticateToken and authorize middleware later

// Get all NPS survey responses
router.get('/', npsController.getAllNpsSurveys); // Add authenticateToken and authorize middleware later

// Get a single NPS survey response by ID
router.get('/:id', npsController.getNpsSurveyById); // Add authenticateToken and authorize middleware later

// Update an NPS survey response
router.put('/:id', npsSurveyValidationRules, npsController.updateNpsSurvey); // Add authenticateToken and authorize middleware later

// Delete an NPS survey response
router.delete('/:id', npsController.deleteNpsSurvey); // Add authenticateToken and authorize middleware later

// Calculate NPS score
router.get('/calculate-nps', [
    query('startDate').optional().isISO8601().toDate().withMessage('Data de início inválida.'),
    query('endDate').optional().isISO8601().toDate().withMessage('Data de término inválida.'),
], npsController.calculateNpsScore); // Add authenticateToken and authorize middleware later

module.exports = router;