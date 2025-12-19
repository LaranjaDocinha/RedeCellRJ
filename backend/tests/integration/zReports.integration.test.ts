import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';
import { seedSale, cleanupSale, getAdminUserId, seedBranch, seedCustomer, seedProduct } from '../utils/seedTestData';
import { v4 as uuidv4 } from 'uuid';

describe('Z-Reports API', () => {
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
    server = httpServer.listen(4005); // Start the server for tests
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
      150,
      [{ productId: testProductId, variationId: testVariantId, quantity: 1, unitPrice: 150, costPrice: 75 }],
      [{ method: 'cash', amount: 150 }]
    )).saleId;

    // Seed another sale for today with a different payment method
    const today2 = new Date();
    today2.setHours(14, 0, 0, 0);
    await seedSale(
      pool,
      userId,
      testCustomerId.toString(),
      today2.toISOString(),
      250,
      [{ productId: product2.productId, variationId: product2.variationId, quantity: 1, unitPrice: 250, costPrice: 125 }],
      [{ method: 'credit_card', amount: 250 }]
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
      75,
      [{ productId: product3.productId, variationId: product3.variationId, quantity: 1, unitPrice: 75, costPrice: 37.5 }],
      [{ method: 'pix', amount: 75 }]
    );
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/reports/z-report', () => {
    it('should successfully retrieve the Z-Report for today', async () => {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const res = await request(app)
        .get(`/api/reports/z-report?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalSalesAmount');
      expect(res.body).toHaveProperty('totalTransactions');
      expect(res.body).toHaveProperty('salesByPaymentMethod');
      expect(res.body).toHaveProperty('salesByCategory');
      expect(res.body.totalSalesAmount).toBeCloseTo(400); // 150 + 250
      expect(res.body.totalTransactions).toEqual(2);

      expect(res.body.salesByPaymentMethod).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ method: 'credit_card', amount: 250 }),
          expect.objectContaining({ method: 'cash', amount: 150 }),
        ]),
      );

      expect(res.body.salesByCategory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: 'Accessories', amount: 250 }),
          expect.objectContaining({ category: 'Electronics', amount: 150 }),
        ]),
      );
    });

    it('should return a report with zero values if no sales in the specified range', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // A week from now
      const startDate = new Date(futureDate.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(futureDate.setHours(23, 59, 59, 999)).toISOString();

      const res = await request(app)
        .get(`/api/reports/z-report?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.totalSalesAmount).toEqual(0);
      expect(res.body.totalTransactions).toEqual(0);
      expect(res.body.salesByPaymentMethod).toEqual([]);
      expect(res.body.salesByCategory).toEqual([]);
    });

    it('should return 401 if not authenticated', async () => {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const res = await request(app).get(
        `/api/reports/z-report?startDate=${startDate}&endDate=${endDate}`,
      );

      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 for invalid date format', async () => {
      const res = await request(app)
        .get('/api/reports/z-report?startDate=invalid-date&endDate=invalid-date')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Validation failed');
    });
  });
});
