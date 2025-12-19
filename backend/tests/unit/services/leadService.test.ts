import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Pool } from 'pg'; // Importação para o tipo Pool
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addLeadActivity,
  getLeadActivities,
} from '../../../src/services/leadService.js';
import { AppError } from '../../../src/utils/errors.js';
import { getPool } from '../../../src/db/index.js';

// Mock do pool de conexão do PostgreSQL
const mockQuery = vi.fn();
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => ({
    query: mockQuery,
  })),
}));

describe('LeadService', () => {
  beforeEach(() => {
    mockQuery.mockReset(); // Limpar mocks antes de cada teste
  });

  describe('createLead', () => {
    it('should successfully create a new lead', async () => {
      const leadData = {
        name: 'Test Lead',
        email: 'test@example.com',
        phone: '123456789',
        source: 'website',
        assignedTo: 'user-uuid-123',
      };
      const expectedLead = { id: 1, status: 'new', ...leadData };
      mockQuery.mockResolvedValueOnce({ rows: [{ ...expectedLead, assigned_to: leadData.assignedTo, created_at: new Date(), updated_at: new Date() }] });

      const newLead = await createLead(leadData);
      expect(newLead).toEqual(expect.objectContaining({ ...expectedLead }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO leads (name, email, phone, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        ['Test Lead', 'test@example.com', '123456789', 'website', 'new', 'user-uuid-123'],
      );
    });

    it('should throw AppError if database query fails', async () => {
      mockQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      const leadData = {
        name: 'Test Lead',
        email: 'test@example.com',
        source: 'website',
      };
      await expect(createLead(leadData)).rejects.toThrow(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllLeads', () => {
    it('should return all leads', async () => {
      const dbLeads = [
        { id: 1, name: 'Lead 1', email: 'l1@example.com', source: 'web', status: 'new', assigned_to: null, created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Lead 2', email: 'l2@example.com', source: 'ref', status: 'contacted', assigned_to: 'user-uuid-456', created_at: new Date(), updated_at: new Date() },
      ];
      mockQuery.mockResolvedValueOnce({ rows: dbLeads });

      const leads = await getAllLeads();
      expect(leads.length).toBe(2);
      expect(leads[0]).toEqual(expect.objectContaining({ id: 1, name: 'Lead 1', email: 'l1@example.com' }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM leads ORDER BY created_at DESC');
    });

    it('should return empty array if no leads', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const leads = await getAllLeads();
      expect(leads).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError if database query fails', async () => {
      mockQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      await expect(getAllLeads()).rejects.toThrow(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLeadById', () => {
    it('should return a lead if found', async () => {
      const dbLead = { id: 1, name: 'Lead 1', email: 'l1@example.com', source: 'web', status: 'new', assigned_to: null, created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValueOnce({ rows: [dbLead] });

      const lead = await getLeadById(1);
      expect(lead).toEqual(expect.objectContaining({ id: 1, name: 'Lead 1' }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM leads WHERE id = $1', [1]);
    });

    it('should return null if lead not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const lead = await getLeadById(999);
      expect(lead).toBeNull();
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError if database query fails', async () => {
      mockQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      await expect(getLeadById(1)).rejects.toThrow(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateLead', () => {
    it('should update multiple fields of a lead', async () => {
      const updatedData = { email: 'updated@example.com', status: 'contacted' as const };
      const dbLead = { id: 1, name: 'Lead 1', email: updatedData.email, source: 'web', status: updatedData.status, assigned_to: null, created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValueOnce({ rows: [dbLead] });

      const updatedLead = await updateLead(1, updatedData);
      expect(updatedLead).toEqual(expect.objectContaining({ id: 1, email: updatedData.email, status: updatedData.status }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE leads SET email = \$1, status = \$2, updated_at = NOW\(\) WHERE id = \$3 RETURNING \*/s),
        ['updated@example.com', 'contacted', 1],
      );
    });

    it('should update a single field of a lead', async () => {
      const updatedData = { phone: '987654321' };
      const dbLead = { id: 1, name: 'Lead 1', email: 'l1@example.com', source: 'web', status: 'new', phone: updatedData.phone, assigned_to: null, created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValueOnce({ rows: [dbLead] });

      const updatedLead = await updateLead(1, updatedData);
      expect(updatedLead).toEqual(expect.objectContaining({ id: 1, phone: updatedData.phone }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE leads SET phone = \$1, updated_at = NOW\(\) WHERE id = \$2 RETURNING \*/s),
        ['987654321', 1],
      );
    });

    it('should return the current lead if no fields are updated', async () => {
      const dbLead = { id: 1, name: 'Lead 1', email: 'l1@example.com', source: 'web', status: 'new', assigned_to: null, created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValueOnce({ rows: [dbLead] }); // For getLeadById
      mockQuery.mockResolvedValueOnce({ rows: [dbLead] }); // For the update itself, though it shouldn't hit

      const lead = await updateLead(1, {});
      expect(lead).toEqual(expect.objectContaining({ id: 1, name: 'Lead 1' }));
      expect(mockQuery).toHaveBeenCalledTimes(1); // Only getLeadById should be called
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM leads WHERE id = $1', [1]);
    });

    it('should return null if lead not found for update', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const updatedLead = await updateLead(999, { name: 'Non Existent' });
      expect(updatedLead).toBeNull();
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError if database query fails', async () => {
      mockQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      await expect(updateLead(1, { name: 'Failed' })).rejects.toThrow(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteLead', () => {
    it('should return true if lead is successfully deleted', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await deleteLead(1);
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM leads WHERE id = $1', [1]);
    });

    it('should return false if lead not found for deletion', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await deleteLead(999);
      expect(result).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError if database query fails', async () => {
      mockQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      await expect(deleteLead(1)).rejects.toThrow(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('addLeadActivity', () => {
    it('should successfully add a new lead activity', async () => {
      const activityData = {
        leadId: 1,
        activityType: 'call' as const,
        description: 'Called lead to discuss project',
        activityDate: new Date('2025-12-15T10:00:00Z'),
        userId: 'user-uuid-123',
      };
      const expectedActivity = { id: 1, ...activityData };
      mockQuery.mockResolvedValueOnce({ rows: [{ ...expectedActivity, lead_id: activityData.leadId, activity_type: activityData.activityType, activity_date: activityData.activityDate, user_id: activityData.userId, created_at: new Date() }] });

      const newActivity = await addLeadActivity(activityData);
      expect(newActivity).toEqual(expect.objectContaining({ id: 1, leadId: activityData.leadId, activityType: activityData.activityType }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO lead_activities (lead_id, activity_type, description, activity_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [activityData.leadId, activityData.activityType, activityData.description, activityData.activityDate, activityData.userId],
      );
    });

    it('should throw AppError if database query fails', async () => {
      mockQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      const activityData = {
        leadId: 1,
        activityType: 'email' as const,
        description: 'Sent follow-up email',
        activityDate: new Date(),
        userId: 'user-uuid-123',
      };
      await expect(addLeadActivity(activityData)).rejects.toThrow(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLeadActivities', () => {
    it('should return activities for a given lead ID', async () => {
      const dbActivities = [
        { id: 1, lead_id: 1, activity_type: 'call', description: 'Call 1', activity_date: new Date(), user_id: 'user1', created_at: new Date(), user_name: 'User One' },
        { id: 2, lead_id: 1, activity_type: 'email', description: 'Email 1', activity_date: new Date(), user_id: 'user2', created_at: new Date(), user_name: 'User Two' },
      ];
      mockQuery.mockResolvedValueOnce({ rows: dbActivities });

      const activities = await getLeadActivities(1);
      expect(activities.length).toBe(2);
      expect(activities[0]).toEqual(expect.objectContaining({ leadId: 1, activityType: 'call', description: 'Call 1' }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT la\.\*,\s*u\.name\s*as\s*user_name\s*FROM\s*lead_activities\s*la\s*JOIN\s*users\s*u\s*ON\s*la\.user_id\s*=\s*u\.id\s*WHERE\s*lead_id\s*=\s*\$1\s*ORDER BY activity_date DESC/s),
        [1],
      );
    });

    it('should return empty array if no activities found for lead', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const activities = await getLeadActivities(1);
      expect(activities).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError if database query fails', async () => {
      mockQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      await expect(getLeadActivities(1)).rejects.toThrow(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });
});
