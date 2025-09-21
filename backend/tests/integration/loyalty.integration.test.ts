import request from 'supertest';
import app from '../../src/index';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getTestPool } from '../testPool';

import { teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';
import { authService } from '../../src/services/authService';

// Mock the db module
vi.mock('../../src/db/index.js', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_, prop) => Reflect.get(getTestPool(), prop),
  }),
}));

describe('Loyalty API', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: number;
  let userId: number;

  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['users', 'loyalty_transactions']);

    // Create test users
    const adminUser = await authService.register('admin@loyalty.com', 'password123', 'admin');
    adminToken = adminUser.token;
    adminId = adminUser.user.id;

    const regularUser = await authService.register('user@loyalty.com', 'password123', 'user');
    userToken = regularUser.token;
    userId = regularUser.user.id;
  });

  it('should get loyalty points for a user', async () => {
    const res = await request(app)
      .get('/api/loyalty/points')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('loyalty_points');
    expect(res.body.loyalty_points).toEqual(0); // Default points
  });

  it('should add loyalty points (admin/manager only)', async () => {
    const res = await request(app)
      .post('/api/loyalty/add-points')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: userId, points: 100, reason: 'Purchase' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.loyalty_points).toEqual(100);

    // Verify points are updated
    const fetchRes = await request(app)
      .get('/api/loyalty/points')
      .set('Authorization', `Bearer ${userToken}`);
    expect(fetchRes.body.loyalty_points).toEqual(100);
  });

  it('should redeem loyalty points', async () => {
    const res = await request(app)
      .post('/api/loyalty/redeem-points')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ points: 50, reason: 'Discount' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.loyalty_points).toEqual(50); // 100 - 50

    // Verify points are updated
    const fetchRes = await request(app)
      .get('/api/loyalty/points')
      .set('Authorization', `Bearer ${userToken}`);
    expect(fetchRes.body.loyalty_points).toEqual(50);
  });

  it('should get loyalty transactions', async () => {
    const res = await request(app)
      .get('/api/loyalty/transactions')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(2); // Add and redeem
    expect(res.body[0]).toHaveProperty('points_change');
    expect(res.body[0]).toHaveProperty('reason');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/loyalty/points');
    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 if not authorized to add points', async () => {
    const res = await request(app)
      .post('/api/loyalty/add-points')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId: userId, points: 10, reason: 'Unauthorized' });
    expect(res.statusCode).toEqual(403);
  });
});
