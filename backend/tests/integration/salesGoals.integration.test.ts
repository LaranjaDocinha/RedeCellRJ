import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';
import { seedSale, cleanupSale, getAdminUserId, seedBranch, seedCustomer, seedProduct } from '../utils/seedTestData';
import { v4 as uuidv4 } from 'uuid';

describe('Sales Goals API', () => {
  let adminToken: string;
  let server: any;
  let testSaleId: string;
  let testCustomerId: number;
  let testProductId: number;
  let testVariantId: number;
  let testBranchId: number;
  let userId: string;

  setupTestCleanup();

  beforeAll(async () => {
    server = httpServer.listen(4006); // Start the server for tests
    const pool = getPool();
    
    userId = (await getAdminUserId(pool)).id;
    testBranchId = await seedBranch(pool);
    testCustomerId = await seedCustomer(pool);

    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.token;

    const product1 = await seedProduct(testBranchId, pool);
    testProductId = product1.productId;
    testVariantId = product1.variationId;
    const product2 = await seedProduct(testBranchId, pool);
    const product3 = await seedProduct(testBranchId, pool);

    // Seed a test sale for today
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    testSaleId = (await seedSale(
      pool,
      userId,
      testCustomerId.toString(),
      today.toISOString(),
      300,
      [{ productId: testProductId, variationId: testVariantId, quantity: 1, unitPrice: 300, costPrice: 150 }],
      [{ method: 'cash', amount: 300 }]
    )).saleId;

    // Seed another sale for today
    const today2 = new Date();
    today2.setHours(14, 0, 0, 0);
    await seedSale(
      pool,
      userId,
      testCustomerId.toString(),
      today2.toISOString(),
      200,
      [{ productId: product2.productId, variationId: product2.variationId, quantity: 1, unitPrice: 200, costPrice: 100 }],
      [{ method: 'credit_card', amount: 200 }]
    );

    // Seed an older sale (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    await seedSale(
      pool,
      userId,
      testCustomerId.toString(),
      yesterday.toISOString(),
      50,
      [{ productId: product3.productId, variationId: product3.variationId, quantity: 1, unitPrice: 50, costPrice: 25 }],
      [{ method: 'pix', amount: 50 }]
    );
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/sales-goals/current-daily', () => {
    it('should successfully retrieve the current daily sales goal', async () => {
      const res = await request(app)
        .get('/api/sales-goals/current-daily')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('targetAmount');
      expect(res.body).toHaveProperty('currentSalesAmount');
      expect(res.body).toHaveProperty('progressPercentage');
      expect(res.body).toHaveProperty('remainingAmount');

      expect(res.body.targetAmount).toEqual(1000); // Fixed target from service
      expect(res.body.currentSalesAmount).toBeCloseTo(500); // 300 + 200
      expect(res.body.progressPercentage).toBeCloseTo(50); // 500 / 1000 * 100
      expect(res.body.remainingAmount).toBeCloseTo(500); // 1000 - 500
    });

    it('should return a goal with zero current sales if no sales for today', async () => {
      // Temporarily remove sales for this test
      const pool = getPool();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await pool.query('DELETE FROM sales WHERE sale_date >= $1', [today]);

      const res = await request(app)
        .get('/api/sales-goals/current-daily')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.targetAmount).toEqual(1000);
      expect(res.body.currentSalesAmount).toEqual(0);
      expect(res.body.progressPercentage).toEqual(0);
      expect(res.body.remainingAmount).toEqual(1000);

      // Re-seed sales for subsequent tests
      const todayRe = new Date();
      todayRe.setHours(10, 0, 0, 0);
      await seedSale(pool, {
        saleDate: todayRe,
        paymentMethod: 'cash',
        totalAmount: 300,
        productName: 'Goal Product 1 Re',
        categoryName: 'Electronics',
      });
      const today2Re = new Date();
      today2Re.setHours(14, 0, 0, 0);
      await seedSale(pool, {
        saleDate: today2Re,
        paymentMethod: 'credit_card',
        totalAmount: 200,
        productName: 'Goal Product 2 Re',
        categoryName: 'Accessories',
      });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/sales-goals/current-daily');

      expect(res.statusCode).toEqual(401);
    });
  });
});
