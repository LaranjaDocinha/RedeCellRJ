import { getPool } from '../db/index.js';

interface Lead {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  source: string; // Ex: 'website', 'referral', 'event'
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  assignedTo?: string; // User ID (UUID)
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeadActivity {
  id?: number;
  leadId: number;
  activityType: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  activityDate: Date;
  userId: string; // User who performed the activity (UUID)
  createdAt?: Date;
}

// Helper to map DB snake_case to CamelCase
const mapLeadFromDb = (dbLead: any): Lead => ({
  id: dbLead.id,
  name: dbLead.name,
  email: dbLead.email,
  phone: dbLead.phone,
  source: dbLead.source,
  status: dbLead.status,
  assignedTo: dbLead.assigned_to,
  createdAt: dbLead.created_at,
  updatedAt: dbLead.updated_at,
});

const mapActivityFromDb = (dbActivity: any): LeadActivity => ({
  id: dbActivity.id,
  leadId: dbActivity.lead_id,
  activityType: dbActivity.activity_type,
  description: dbActivity.description,
  activityDate: dbActivity.activity_date,
  userId: dbActivity.user_id,
  createdAt: dbActivity.created_at,
});

export const createLead = async (
  leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
): Promise<Lead> => {
  const pool = getPool();
  const { name, email, phone, source, assignedTo } = leadData;
  const result = await pool.query(
    'INSERT INTO leads (name, email, phone, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, email, phone, source, 'new', assignedTo],
  );
  return mapLeadFromDb(result.rows[0]);
};

export const getAllLeads = async (): Promise<Lead[]> => {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
  return result.rows.map(mapLeadFromDb);
};

export const getLeadById = async (id: number): Promise<Lead | null> => {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
  return result.rows[0] ? mapLeadFromDb(result.rows[0]) : null;
};

export const updateLead = async (id: number, leadData: Partial<Lead>): Promise<Lead | null> => {
  const pool = getPool();
  const { name, email, phone, source, status, assignedTo } = leadData;
  const fields = [];
  const values = [];
  let queryIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${queryIndex++}`);
    values.push(name);
  }
  if (email !== undefined) {
    fields.push(`email = $${queryIndex++}`);
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push(`phone = $${queryIndex++}`);
    values.push(phone);
  }
  if (source !== undefined) {
    fields.push(`source = $${queryIndex++}`);
    values.push(source);
  }
  if (status !== undefined) {
    fields.push(`status = $${queryIndex++}`);
    values.push(status);
  }
  if (assignedTo !== undefined) {
    fields.push(`assigned_to = $${queryIndex++}`);
    values.push(assignedTo);
  }

  if (fields.length === 0) {
    return getLeadById(id);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE leads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${queryIndex} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapLeadFromDb(result.rows[0]) : null;
};

export const deleteLead = async (id: number): Promise<boolean> => {
  const pool = getPool();
  const result = await pool.query('DELETE FROM leads WHERE id = $1', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
};

export const addLeadActivity = async (
  activityData: Omit<LeadActivity, 'id' | 'createdAt'>,
): Promise<LeadActivity> => {
  const pool = getPool();
  const { leadId, activityType, description, activityDate, userId } = activityData;
  const result = await pool.query(
    'INSERT INTO lead_activities (lead_id, activity_type, description, activity_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [leadId, activityType, description, activityDate, userId],
  );
  return mapActivityFromDb(result.rows[0]);
};

export const getLeadActivities = async (leadId: number): Promise<LeadActivity[]> => {
  const pool = getPool();
  const result = await pool.query(
    'SELECT la.*, u.name as user_name FROM lead_activities la JOIN users u ON la.user_id = u.id WHERE lead_id = $1 ORDER BY activity_date DESC',
    [leadId],
  );
  return result.rows.map(mapActivityFromDb);
};
// Assuming these migrations exist in the database (or will be added)
// CREATE TABLE leads (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   email VARCHAR(255) UNIQUE NOT NULL,
//   phone VARCHAR(50),
//   source VARCHAR(50),
//   status VARCHAR(50) NOT NULL DEFAULT 'new',
//   assigned_to INTEGER REFERENCES users(id),
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE lead_activities (
//   id SERIAL PRIMARY KEY,
//   lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
//   activity_type VARCHAR(50) NOT NULL,
//   description TEXT,
//   activity_date TIMESTAMP WITH TIME ZONE,
//   user_id INTEGER REFERENCES users(id),
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );
