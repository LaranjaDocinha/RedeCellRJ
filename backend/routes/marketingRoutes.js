const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const marketingController = require('../controllers/marketingController');

// Obter todas as campanhas de marketing
router.get('/', [authenticateToken, authorize('marketing:read')], marketingController.getAllMarketingCampaigns);

// Obter uma campanha de marketing por ID
router.get('/:id', [authenticateToken, authorize('marketing:read')], marketingController.getMarketingCampaignById);

// Criar uma nova campanha de marketing
router.post('/', [authenticateToken, authorize('marketing:create')], marketingController.createMarketingCampaign);

// Atualizar uma campanha de marketing
router.put('/:id', [authenticateToken, authorize('marketing:update')], marketingController.updateMarketingCampaign);

// Deletar uma campanha de marketing
router.delete('/:id', [authenticateToken, authorize('marketing:delete')], marketingController.deleteMarketingCampaign);

// Enviar uma campanha de marketing (manual trigger for now)
router.post('/:id/send', [authenticateToken, authorize('marketing:send')], marketingController.sendMarketingCampaign);

// Obter relatórios de campanha
router.get('/:id/report', [authenticateToken, authorize('marketing:read')], marketingController.getCampaignReport);

module.exports = router;
