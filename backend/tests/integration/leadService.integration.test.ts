import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createLead, getLeadById, updateLead, deleteLead, addLeadActivity, getLeadActivities } from '../../src/services/leadService.js';
import { connect, query, closePool } from '../../src/db/index.js'; // Assuming closePool is exported
import { v4 as uuidv4 } from 'uuid'; // For generating a dummy user ID if needed

describe('Lead Service Integration Tests', () => {
  let testUserId: string; // User IDs are UUIDs (strings)
  let createdLeadId: number;

  beforeAll(async () => {
    // Ensure the test DB is clean and necessary tables exist
    // This is handled by global setup or migrations run before tests
    // Create a dummy user for 'assignedTo' and 'userId' in activities
    const userRes = await query('INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [uuidv4(), 'Test Lead User', `testuser-${Date.now()}@example.com`, 'hashedpassword']);
    testUserId = userRes.rows[0].id;
  });

  afterAll(async () => {
    // Clean up any test data
    await query('DELETE FROM lead_activities WHERE lead_id = $1', [createdLeadId]);
    await query('DELETE FROM leads WHERE id = $1', [createdLeadId]);
    await query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  it('should create a new lead', async () => {
    const leadData = {
      name: 'Test Lead',
      email: `testlead-${Date.now()}@example.com`,
      phone: '11999999999',
      source: 'Website',
      assignedTo: testUserId,
    };

    const newLead = await createLead(leadData);
    expect(newLead).toBeDefined();
    expect(newLead.id).toBeDefined();
    expect(newLead.name).toBe(leadData.name);
    expect(newLead.email).toBe(leadData.email);
    expect(newLead.status).toBe('new');
    createdLeadId = newLead.id!;
  });

  it('should retrieve a lead by ID', async () => {
    const fetchedLead = await getLeadById(createdLeadId);
    expect(fetchedLead).toBeDefined();
    expect(fetchedLead?.id).toBe(createdLeadId);
  });

  it('should update a lead', async () => {
    const updateData = {
      status: 'contacted',
      phone: '11888888888',
    };
    const updatedLead = await updateLead(createdLeadId, updateData);
    expect(updatedLead).toBeDefined();
    expect(updatedLead?.id).toBe(createdLeadId);
    expect(updatedLead?.status).toBe(updateData.status);
    expect(updatedLead?.phone).toBe(updateData.phone);
  });

  it('should add an activity to a lead', async () => {
    const activityData = {
      leadId: createdLeadId,
      activityType: 'call',
      description: 'Called lead to follow up',
      activityDate: new Date(),
      userId: testUserId,
    };
    const newActivity = await addLeadActivity(activityData);
    console.log('New Activity:', newActivity); // Debug
    expect(newActivity).toBeDefined();
    expect(newActivity.id).toBeDefined();
    expect(newActivity.leadId).toBe(createdLeadId);
    expect(newActivity.activityType).toBe(activityData.activityType);
  });

  it('should retrieve lead activities', async () => {
    const activities = await getLeadActivities(createdLeadId);
    console.log('Retrieved Activities:', activities); // Debug
    expect(activities).toBeDefined();
    expect(activities.length).toBeGreaterThan(0);
    expect(activities[0].leadId).toBe(createdLeadId);
  });

  it('should delete a lead', async () => {
    const deleted = await deleteLead(createdLeadId);
    expect(deleted).toBe(true);

    const fetchedLead = await getLeadById(createdLeadId);
    expect(fetchedLead).toBeNull();
  });
});
