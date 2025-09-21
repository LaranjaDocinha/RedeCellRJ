
import request from 'supertest';
import app from '../../src/index';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupIntegrationTestDatabase, teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';
import { authService } from '../../src/services/authService';

import { testPool } from '../testPool';

import { getTestPool } from '../testPool';

describe('User Dashboard API', () => {
  let authToken: string;
  let testUserId: number;

  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['users', 'user_dashboard_settings']);

    // Create a test user and get a token
    const testEmail = 'testuser@dashboard.com';
    const testPassword = 'password123';
    const { user, token } = await authService.register(testEmail, testPassword, 'user');
    authToken = token;
    testUserId = user.id;
  });

  it('should return default settings if no custom settings exist', async () => {
    const res = await request(app)
      .get('/api/user-dashboard/settings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('widgets');
    expect(res.body.widgets).toHaveLength(3); // Default widgets
    expect(res.body.widgets[0].id).toBe('totalSales');
  });

  it('should update user dashboard settings', async () => {
    const newSettings = {
      widgets: [
        { id: 'totalSales', visible: false, order: 1 },
        { id: 'topSellingProductsChart', visible: true, order: 0 },
      ],
    };

    const res = await request(app)
      .put('/api/user-dashboard/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newSettings);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(newSettings);

    // Verify by fetching again
    const fetchRes = await request(app)
      .get('/api/user-dashboard/settings')
      .set('Authorization', `Bearer ${authToken}`);
    expect(fetchRes.statusCode).toEqual(200);
    expect(fetchRes.body).toEqual(newSettings);
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/user-dashboard/settings');
    expect(res.statusCode).toEqual(401);
  });

  it('should access the test route', async () => {
    const res = await request(app).get('/test-route');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Test route works!');
  });
});
