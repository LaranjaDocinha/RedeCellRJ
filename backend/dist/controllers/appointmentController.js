import * as appointmentService from '../services/appointmentService.js';
export const createAppointment = async (req, res) => {
    try {
        const { customer_id, service_type, appointment_date, notes } = req.body;
        const appointment = await appointmentService.createAppointment(customer_id, service_type, new Date(appointment_date), notes);
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const appointment = await appointmentService.updateAppointmentStatus(parseInt(id, 10), status);
        if (appointment) {
            res.json(appointment);
        }
        else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await appointmentService.deleteAppointment(parseInt(id, 10));
        if (appointment) {
            res.json({ message: 'Appointment deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAppointments = async (req, res) => {
    try {
        const appointments = await appointmentService.getAppointments();
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAvailableSlots = async (req, res) => {
    try {
        const { date, serviceType } = req.query;
        if (!date || !serviceType) {
            return res.status(400).json({ message: 'Date and serviceType parameters are required.' });
        }
        const slots = await appointmentService.getAvailableSlots(new Date(date), serviceType);
        res.json(slots);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await appointmentService.confirmAppointment(parseInt(id, 10));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
