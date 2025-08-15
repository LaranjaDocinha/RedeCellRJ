const express = require('express');
const router = express.Router();
const marketingCampaignController = require('../controllers/marketingCampaignController');
const { body } = require('express-validator'); // For validation

// Validation rules for creating and updating a marketing campaign
const marketingCampaignValidationRules = [
    body('name').notEmpty().withMessage('Nome da campanha é obrigatório.'),
    body('type').isIn(['Email', 'SMS']).withMessage('Tipo de campanha inválido. Deve ser \'Email\' ou \'SMS\'.'),
    body('message_template').notEmpty().withMessage('Template da mensagem é obrigatório.'),
    body('created_by_user_id').isInt({ min: 1 }).withMessage('ID do usuário criador é obrigatório e deve ser um número inteiro.'),
    body('status').isIn(['Draft', 'Scheduled', 'Sent', 'Failed', 'Cancelled']).withMessage('Status da campanha inválido.'),
    body('scheduled_date_time').optional().isISO8601().toDate().withMessage('Data/hora agendada inválida.'),
];

// Create a new marketing campaign
router.post('/', marketingCampaignValidationRules, marketingCampaignController.createMarketingCampaign); // Add authenticateToken and authorize middleware later

// Get all marketing campaigns
router.get('/', marketingCampaignController.getAllMarketingCampaigns); // Add authenticateToken and authorize middleware later

// Get a single marketing campaign by ID
router.get('/:id', marketingCampaignController.getMarketingCampaignById); // Add authenticateToken and authorize middleware later

// Update a marketing campaign
router.put('/:id', marketingCampaignValidationRules, marketingCampaignController.updateMarketingCampaign); // Add authenticateToken and authorize middleware later

// Delete a marketing campaign
router.delete('/:id', marketingCampaignController.deleteMarketingCampaign); // Add authenticateToken and authorize middleware later

module.exports = router;
