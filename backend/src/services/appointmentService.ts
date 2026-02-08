import pool from '../db/index.js';
import { addHours, startOfHour } from 'date-fns';

export const appointmentService = {
  async findAvailableSlot() {
    const now = new Date();
    let slot = addHours(startOfHour(now), 1);

    for (let i = 0; i < 24; i++) {
      const res = await pool.query(
        'SELECT COUNT(*) FROM service_orders WHERE expected_delivery_date::timestamp >= $1 AND expected_delivery_date::timestamp < $2',
        [slot, addHours(slot, 1)],
      );

      if (parseInt(res.rows[0].count) < 2) {
        return slot;
      }
      slot = addHours(slot, 1);
    }
    return addHours(now, 24);
  },

  async bookAppointment(customerPhone: string, customerName: string, device: string) {
    const slot = await this.findAvailableSlot();

    const res = await pool.query(
      `INSERT INTO service_orders (customer_name, customer_phone, product_description, status, expected_delivery_date, issue_description, brand, services, estimated_cost) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        customerName,
        customerPhone,
        device,
        'Aguardando Avaliação',
        slot,
        'Agendado via WhatsApp',
        'Generic',
        '[]',
        0,
      ],
    );

    return {
      orderId: res.rows[0].id,
      date: slot,
    };
  },

  async createAppointment(customerId: number, serviceType: string, date: Date, notes: string) {
    const res = await pool.query(
      'INSERT INTO service_orders (customer_id, product_description, status, expected_delivery_date, observations) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customerId, serviceType, 'Aguardando Avaliação', date, notes],
    );
    return res.rows[0];
  },

  async updateAppointmentStatus(id: number, status: string) {
    const res = await pool.query(
      'UPDATE service_orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id],
    );
    return res.rows[0];
  },

  async deleteAppointment(id: number) {
    const res = await pool.query('DELETE FROM service_orders WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  },

  async getAppointments() {
    const res = await pool.query(
      'SELECT * FROM service_orders ORDER BY expected_delivery_date ASC',
    );
    return res.rows;
  },

  async getAvailableSlots(_date: Date, _serviceType: string) {
    // Dummy implementation for compatibility
    return { success: true, slots: [] };
  },

  async confirmAppointment(_id: number) {
    return { success: true };
  },
};
