import { getPool } from '../db/index.js';

export const createAppointment = async (
  customerId: number,
  serviceType: string,
  appointmentDate: Date,
  notes?: string,
) => {
  const result = await getPool().query(
    'INSERT INTO appointments (customer_id, service_type, appointment_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
    [customerId, serviceType, appointmentDate, notes],
  );
  return result.rows[0];
};

export const updateAppointmentStatus = async (id: number, status: string) => {
  const result = await getPool().query(
    'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
    [status, id],
  );
  return result.rows[0];
};

export const deleteAppointment = async (id: number) => {
  const result = await getPool().query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const getAppointments = async () => {
  const result = await getPool().query('SELECT * FROM appointments ORDER BY appointment_date DESC');
  return result.rows;
};

export const getAvailableSlots = async (date: Date, serviceType: string) => {
  console.log(`Simulating available slots for ${serviceType} on ${date.toISOString()}`);
  // In a real scenario, this would query the database for existing appointments
  // and return time slots that are not booked.
  return { success: true, message: 'Available slots (simulated).' };
};

export const confirmAppointment = async (appointmentId: number) => {
  console.log(`Simulating confirming appointment ${appointmentId}.`);
  // In a real scenario, this would update the appointment status to 'confirmed'
  // and potentially send a confirmation email/SMS.
  return { success: true, message: `Appointment ${appointmentId} confirmed (simulated).` };
};
