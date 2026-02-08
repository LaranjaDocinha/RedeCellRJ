import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appointmentService } from '../../../src/services/appointmentService.js';
import * as dbModule from '../../../src/db/index.js';

describe('AppointmentService', () => {
  let mockPool: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPool = dbModule.getPool();
    mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('findAvailableSlot', () => {
    it('should find first available slot if count < 2', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      const slot = await appointmentService.findAvailableSlot();
      expect(slot).toBeDefined();
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should skip slots with count >= 2', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // Slot 1 full
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }); // Slot 2 available

      const slot = await appointmentService.findAvailableSlot();
      expect(slot).toBeDefined();
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should return 24h later if all slots full', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ count: '5' }] }); // All slots full
      const slot = await appointmentService.findAvailableSlot();
      expect(slot).toBeDefined();
      expect(mockPool.query).toHaveBeenCalledTimes(24);
    });
  });

  describe('bookAppointment', () => {
    it('should find slot and insert order', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // find slot
        .mockResolvedValueOnce({ rows: [{ id: 101 }] }); // insert order

      const result = await appointmentService.bookAppointment('123', 'John', 'iPhone');

      expect(result.orderId).toBe(101);
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO service_orders'), expect.arrayContaining(['John', '123']));
    });
  });

  describe('createAppointment', () => {
    it('should insert appointment', async () => {
      const mockAppt = { id: 1 };
      mockPool.query.mockResolvedValueOnce({ rows: [mockAppt] });
      const date = new Date();

      const result = await appointmentService.createAppointment(1, 'Repair', date, 'Notes');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO service_orders'),
        [1, 'Repair', 'Aguardando Avaliação', date, 'Notes'],
      );
      expect(result).toEqual(mockAppt);
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update status', async () => {
      const mockAppt = { id: 1, status: 'confirmed' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockAppt] });

      const result = await appointmentService.updateAppointmentStatus(1, 'confirmed');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE service_orders'),
        ['confirmed', 1],
      );
      expect(result).toEqual(mockAppt);
    });
  });

  describe('deleteAppointment', () => {
    it('should delete and return deleted order', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const res = await appointmentService.deleteAppointment(1);
      expect(res.id).toBe(1);
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM service_orders'), [1]);
    });
  });

  describe('getAppointments', () => {
    it('should return all appointments', async () => {
      const mockAppts = [{ id: 1 }];
      mockPool.query.mockResolvedValueOnce({ rows: mockAppts });

      const result = await appointmentService.getAppointments();
      expect(result).toEqual(mockAppts);
    });
  });

  describe('Simulated Methods', () => {
    it('should return simulated slots', async () => {
      const result = await appointmentService.getAvailableSlots(new Date(), 'Repair');
      expect(result.success).toBe(true);
    });

    it('should return simulated confirmation', async () => {
      const result = await appointmentService.confirmAppointment(1);
      expect(result.success).toBe(true);
    });
  });
});
