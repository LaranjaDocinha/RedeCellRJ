import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';
import { seedSale, cleanupSale, getAdminUserId, seedBranch, seedCustomer, seedProduct } from '../utils/seedTestData';
import { v4 as uuidv4 } from 'uuid';

describe('Shift Reports API', () => {
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
    server = httpServer.listen(4004); // Start the server for tests
    const pool = getPool();
    
    // Get user and branch
    userId = (await getAdminUserId(pool)).id;
    testBranchId = await seedBranch(pool);
    testCustomerId = await seedCustomer(pool);

    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.token;

    // Seed products
    const product1 = await seedProduct(testBranchId, pool);
    testProductId = product1.productId;
    testVariantId = product1.variationId;
    const product2 = await seedProduct(testBranchId, pool);
    const product3 = await seedProduct(testBranchId, pool);

    // Seed a test sale within the last 24 hours
    testSaleId = (await seedSale(
      pool,
      userId,
      testCustomerId.toString(),
      new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      100,
      [{ productId: testProductId, variationId: testVariantId, quantity: 1, unitPrice: 100, costPrice: 50 }],
      [{ method: 'cash', amount: 100 }]
    )).saleId;

    // Seed another sale with a different payment method
    await seedSale(
      pool,
      userId,
      testCustomerId.toString(),
      new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      200,
      [{ productId: product2.productId, variationId: product2.variationId, quantity: 1, unitPrice: 200, costPrice: 100 }],
      [{ method: 'credit_card', amount: 200 }]
    );

    // Seed an older sale (outside the 24-hour window)
    await seedSale(
      pool,
      userId,
      testCustomerId.toString(),
      new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      50,
      [{ productId: product3.productId, variationId: product3.variationId, quantity: 1, unitPrice: 50, costPrice: 25 }],
      [{ method: 'pix', amount: 50 }]
    );
  });

  afterAll(async () => {
    // Basic cleanup managed by setupTestCleanup, explicit server close
    await server.close(); 
  });

  describe('GET /api/shift-reports/current', () => {
    it('should successfully retrieve the current shift report', async () => {
      const res = await request(app)
        .get('/api/shift-reports/current')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalSalesAmount');
      expect(res.body).toHaveProperty('totalTransactions');
      expect(res.body).toHaveProperty('salesByPaymentMethod');
      expect(res.body).toHaveProperty('salesByCategory');
      expect(res.body).toHaveProperty('averageTransactionValue');

      expect(res.body.totalSalesAmount).toBeCloseTo(300); // 100 + 200
      expect(res.body.totalTransactions).toEqual(2);
      expect(res.body.averageTransactionValue).toBeCloseTo(150); // 300 / 2

      expect(res.body.salesByPaymentMethod).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ method: 'credit_card', amount: 200 }),
          expect.objectContaining({ method: 'cash', amount: 100 }),
        ]),
      );

      expect(res.body.salesByCategory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: 'Accessories', amount: 200 }),
          expect.objectContaining({ category: 'Electronics', amount: 100 }),
        ]),
      );
    });

    it('should return a report with zero values if no sales in the current shift', async () => {
      // Temporarily remove sales for this test
      const pool = getPool();
      await pool.query('DELETE FROM sales WHERE sale_date >= $1', [
        new Date(Date.now() - 24 * 60 * 60 * 1000),
      ]);

      const res = await request(app)
        .get('/api/shift-reports/current')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.totalSalesAmount).toEqual(0);
      expect(res.body.totalTransactions).toEqual(0);
      expect(res.body.salesByPaymentMethod).toEqual([]);
      expect(res.body.salesByCategory).toEqual([]);
      expect(res.body.averageTransactionValue).toEqual(0);

      // Re-seed sales for subsequent tests
      await seedSale(pool, {
        saleDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        paymentMethod: 'cash',
        totalAmount: 100,
        productName: 'Shift Product',
        categoryName: 'Electronics',
      });
      await seedSale(pool, {
        saleDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        paymentMethod: 'credit_card',
        totalAmount: 200,
        productName: 'Another Shift Product',
        categoryName: 'Accessories',
      });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/shift-reports/current');

      expect(res.statusCode).toEqual(401);
    });
  });
});
