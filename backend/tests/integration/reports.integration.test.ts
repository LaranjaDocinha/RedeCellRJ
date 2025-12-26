import request from 'supertest';
import { app } from '../../src/app';
import { getPool } from '../../src/db';
import { generateAuthToken } from '../utils/generateAuthToken';
import { setupTestDb, cleanupTestDb } from '../utils/setupTestDb';
import { seedTestDb } from '../utils/seedTestDb';
import { salesGoalService } from '../../src/services/salesGoalService';

describe('Reports Integration Tests', () => {
  let adminToken: string;
  let pool;

  beforeAll(async () => {
    pool = getPool();
    await setupTestDb();
    await seedTestDb();
    adminToken = await generateAuthToken('admin@pdv.com', 'admin123'); // Ensure admin user exists in seed
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  beforeEach(async () => {
    // Clear sales goals between tests if necessary to avoid interference
    await pool.query('DELETE FROM sales_goals');
  });

  it('should get contribution margin by category report', async () => {
    // Arrange: Ensure there are sales items with cost_price and unit_price
    // SeedTestDb should create some sales data
    const res = await request(app)
      .get('/api/reports/contribution-margin-by-category')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Assert
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    
    const firstReportItem = res.body[0];
    expect(firstReportItem).toHaveProperty('category_name');
    expect(firstReportItem).toHaveProperty('contribution_margin');
    expect(typeof firstReportItem.category_name).toBe('string');
    expect(typeof parseFloat(firstReportItem.contribution_margin)).toBe('number');
  });

  it('should return 401 if no authentication token is provided', async () => {
    await request(app)
      .get('/api/reports/contribution-margin-by-category')
      .expect(401);
  });
});