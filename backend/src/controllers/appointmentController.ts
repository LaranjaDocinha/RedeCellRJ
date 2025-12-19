import { Request, Response } from 'express';
import * as appointmentService from '../services/appointmentService.js';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { customer_id, service_type, appointment_date, notes } = req.body;
    const appointment = await appointmentService.createAppointment(
      customer_id,
      service_type,
      new Date(appointment_date),
      notes,
    );
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(parseInt(id, 10), status);
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.deleteAppointment(parseInt(id, 10));
    if (appointment) {
      res.json({ message: 'Appointment deleted successfully' });
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await appointmentService.getAppointments();
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { date, serviceType } = req.query;
    if (!date || !serviceType) {
      return res.status(400).json({ message: 'Date and serviceType parameters are required.' });
    }
    const slots = await appointmentService.getAvailableSlots(
      new Date(date as string),
      serviceType as string,
    );
    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await appointmentService.confirmAppointment(parseInt(id, 10));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
