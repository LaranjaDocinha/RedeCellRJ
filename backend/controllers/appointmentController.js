const db = require('../db');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

// Create a new appointment
exports.createAppointment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { customer_id, service_type, appointment_date_time, notes, status, technician_id } = req.body;

    try {
        const newAppointment = await db.query(
            'INSERT INTO appointments (customer_id, service_type, appointment_date_time, notes, status, technician_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
            ,
            [customer_id, service_type, appointment_date_time, notes, status, technician_id]
        );
        res.status(201).json(newAppointment.rows[0]);
    } catch (error) {
        console.error('Error creating appointment:', error);
        next(new AppError('Erro ao criar agendamento.', 500));
    }
};

// Get all appointments
exports.getAllAppointments = async (req, res, next) => {
    try {
        const appointments = await db.query('SELECT * FROM appointments ORDER BY appointment_date_time DESC');
        res.status(200).json(appointments.rows);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        next(new AppError('Erro ao buscar agendamentos.', 500));
    }
};

// Get a single appointment by ID
exports.getAppointmentById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const appointment = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (appointment.rows.length === 0) {
            return next(new AppError('Agendamento não encontrado.', 404));
        }
        res.status(200).json(appointment.rows[0]);
    } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        next(new AppError('Erro ao buscar agendamento.', 500));
    }
};

// Update an appointment
exports.updateAppointment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { id } = req.params;
    const { service_type, appointment_date_time, notes, status, technician_id } = req.body;

    try {
        const updatedAppointment = await db.query(
            'UPDATE appointments SET service_type = $1, appointment_date_time = $2, notes = $3, status = $4, technician_id = $5, updated_at = NOW() WHERE id = $6 RETURNING *'
            ,
            [service_type, appointment_date_time, notes, status, technician_id, id]
        );
        if (updatedAppointment.rows.length === 0) {
            return next(new AppError('Agendamento não encontrado.', 404));
        }
        res.status(200).json(updatedAppointment.rows[0]);
    } catch (error) {
        console.error('Error updating appointment:', error);
        next(new AppError('Erro ao atualizar agendamento.', 500));
    }
};

// Delete an appointment
exports.deleteAppointment = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedAppointment = await db.query('DELETE FROM appointments WHERE id = $1 RETURNING *'
        , [id]);
        if (deletedAppointment.rows.length === 0) {
            return next(new AppError('Agendamento não encontrado.', 404));
        }
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error('Error deleting appointment:', error);
        next(new AppError('Erro ao excluir agendamento.', 500));
    }
};

// Check technician availability
exports.checkTechnicianAvailability = async (req, res, next) => {
    const { technician_id, start_time, end_time } = req.query;

    if (!technician_id || !start_time || !end_time) {
        return next(new AppError('ID do técnico, hora de início e hora de término são obrigatórios.', 400));
    }

    try {
        const overlappingAppointments = await db.query(
            'SELECT * FROM appointments WHERE technician_id = $1 AND appointment_date_time < $3 AND (appointment_date_time + INTERVAL \'1 hour\') > $2', // Assuming 1 hour duration for simplicity
            [technician_id, start_time, end_time]
        );

        const isAvailable = overlappingAppointments.rows.length === 0;
        res.status(200).json({ isAvailable });
    } catch (error) {
        console.error('Error checking technician availability:', error);
        next(new AppError('Erro ao verificar disponibilidade do técnico.', 500));
    }
};