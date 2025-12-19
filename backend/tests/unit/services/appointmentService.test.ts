import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as appointmentService from '../../../src/services/appointmentService';
import * as dbModule from '../../../src/db/index';

// Mock getPool
const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('AppointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should insert appointment', async () => {
      const mockAppt = { id: 1 };
      mockQuery.mockResolvedValue({ rows: [mockAppt] });
      const date = new Date();

      const result = await appointmentService.createAppointment(1, 'Repair', date, 'Notes');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO appointments'),
        [1, 'Repair', date, 'Notes']
      );
      expect(result).toEqual(mockAppt);
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update status', async () => {
      const mockAppt = { id: 1, status: 'confirmed' };
      mockQuery.mockResolvedValue({ rows: [mockAppt] });

      const result = await appointmentService.updateAppointmentStatus(1, 'confirmed');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointments'),
        ['confirmed', 1]
      );
      expect(result).toEqual(mockAppt);
    });
  });

  describe('deleteAppointment', () => {
    it('should delete appointment', async () => {
      const mockAppt = { id: 1 };
      mockQuery.mockResolvedValue({ rows: [mockAppt] });

      const result = await appointmentService.deleteAppointment(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM appointments'),
        [1]
      );
      expect(result).toEqual(mockAppt);
    });
  });

  describe('getAppointments', () => {
    it('should return all appointments', async () => {
      const mockAppts = [{ id: 1 }];
      mockQuery.mockResolvedValue({ rows: mockAppts });

      const result = await appointmentService.getAppointments();

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM appointments ORDER BY appointment_date DESC'
      );
      
      expect(result).toEqual(mockAppts);
    });
  });
  
  describe('getAvailableSlots', () => {
    it('should return simulated slots', async () => {
        const result = await appointmentService.getAvailableSlots(new Date(), 'Repair');
        expect(result.success).toBe(true);
    });
  });

  describe('confirmAppointment', () => {
      it('should return simulated confirmation', async () => {
          const result = await appointmentService.confirmAppointment(1);
          expect(result.success).toBe(true);
      });
  });
});
