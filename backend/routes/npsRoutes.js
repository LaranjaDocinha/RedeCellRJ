const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const npsController = require('../controllers/npsController');

// Submeter uma nova pesquisa NPS
router.post('/', [authenticateToken, authorize('nps:submit')], npsController.submitNpsSurvey);

// Obter todas as pesquisas NPS
router.get('/', [authenticateToken, authorize('nps:read')], npsController.getAllNpsSurveys);

// Obter relatório NPS
router.get('/report', [authenticateToken, authorize('nps:read_report')], npsController.getNpsReport);

module.exports = router;
