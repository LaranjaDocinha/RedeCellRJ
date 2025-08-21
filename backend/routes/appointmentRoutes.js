const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { body, query } = require('express-validator'); // For validation

// Validation rules for creating and updating an appointment
const appointmentValidationRules = [
    body('customer_id').isInt({ min: 1 }).withMessage('ID do cliente é obrigatório e deve ser um número inteiro.'),
    body('service_type').notEmpty().withMessage('Tipo de serviço é obrigatório.'),
    body('appointment_date_time').isISO8601().toDate().withMessage('Data e hora do agendamento inválidas.'),
    body('notes').optional().isString().withMessage('Notas devem ser uma string.'),
    body('status').isIn(['Pending', 'Confirmed', 'Cancelled', 'Completed']).withMessage('Status inválido.'),
    body('technician_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('ID do técnico deve ser um número inteiro.'),
];

// Create a new appointment
router.post('/', appointmentValidationRules, appointmentController.createAppointment); // Add authenticateToken and authorize middleware later

// Get all appointments
router.get('/', appointmentController.getAllAppointments); // Add authenticateToken and authorize middleware later

// Check technician availability
router.get('/check-availability', [
    query('technician_id').isInt({ min: 1 }).withMessage('ID do técnico é obrigatório e deve ser um número inteiro.'),
    query('start_time').isISO8601().toDate().withMessage('Hora de início inválida.'),
    query('end_time').isISO8601().toDate().withMessage('Hora de término inválida.'),
], appointmentController.checkTechnicianAvailability); // Add authenticateToken and authorize middleware later

// Get a single appointment by ID
router.get('/:id', appointmentController.getAppointmentById); // Add authenticateToken and authorize middleware later

// Update an appointment
router.put('/:id', appointmentValidationRules, appointmentController.updateAppointment); // Add authenticateToken and authorize middleware later

// Delete an appointment
router.delete('/:id', appointmentController.deleteAppointment); // Add authenticateToken and authorize middleware later

module.exports = router;