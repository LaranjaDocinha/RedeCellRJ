console.log('[TechnicianRoutes] Loaded');
const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const technicianController = require('../controllers/technicianController');

// Obter todos os técnicos
router.get('/', [authenticateToken, authorize('repairs:read')], technicianController.getAllTechnicians);

// Criar um novo técnico
router.post('/', [authenticateToken, authorize('repairs:assign')], technicianController.createTechnician);

// Deletar um técnico
router.delete('/:id', [authenticateToken, authorize('repairs:assign')], technicianController.deleteTechnician);

module.exports = router;
