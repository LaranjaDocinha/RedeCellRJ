const express = require('express');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const leadController = require('../controllers/leadController');

const router = express.Router();

// Rotas para Leads
router.get('/', [authenticateToken, authorize('leads:read')], leadController.getAllLeads);
router.get('/:id', [authenticateToken, authorize('leads:read')], leadController.getLeadById);
router.post('/', [authenticateToken, authorize('leads:create')], leadController.createLead);
router.put('/:id', [authenticateToken, authorize('leads:update')], leadController.updateLead);
router.delete('/:id', [authenticateToken, authorize('leads:delete')], leadController.deleteLead);

module.exports = router;
