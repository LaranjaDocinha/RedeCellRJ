const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rotas para /api/technicians
router.get('/', authenticateToken, technicianController.getAllTechnicians);
router.post('/', authenticateToken, technicianController.createTechnician);

// Rotas para /api/technicians/:id
router.get('/:id', authenticateToken, technicianController.getTechnicianById);
router.put('/:id', authenticateToken, technicianController.updateTechnician);
router.delete('/:id', authenticateToken, technicianController.deleteTechnician);

module.exports = router;