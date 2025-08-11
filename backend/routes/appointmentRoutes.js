const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// Criar um novo agendamento
router.post('/', [authenticateToken, authorize('appointments:create')], appointmentController.createAppointment);

// Obter todos os agendamentos
router.get('/', [authenticateToken, authorize('appointments:read')], appointmentController.getAllAppointments);

// Obter um agendamento por ID
router.get('/:id', [authenticateToken, authorize('appointments:read')], appointmentController.getAppointmentById);

// Atualizar um agendamento
router.put('/:id', [authenticateToken, authorize('appointments:update')], appointmentController.updateAppointment);

// Deletar um agendamento
router.delete('/:id', [authenticateToken, authorize('appointments:delete')], appointmentController.deleteAppointment);

module.exports = router;
