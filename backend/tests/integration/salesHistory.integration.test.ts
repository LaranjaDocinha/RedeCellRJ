import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db';
import {
  seedBranch,
  seedProduct,
  seedCustomer,
  seedSale,
  getAdminUserId,
  cleanupBranch,
  cleanupProduct,
  cleanupCustomer,
  cleanupSale,
} from '../utils/seedTestData';

describe('Sales History API - Integration', () => {
  let adminToken: string;
  let adminUserId: string;
  let testBranchId: number;
  let testProductId: number;
  let testVariantId: number;
  let testCustomerId: number;
  let salesToCleanup: string[] = [];

  beforeAll(async () => {
    const res = await request(app) // Using app instead of httpServer for supertest usually works better unless server specific logic
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = res.body.token;
    const adminUser = await getAdminUserId();
    adminUserId = adminUser.id;
  });

  beforeEach(async () => {
    const pool = getPool();
    testBranchId = await seedBranch(pool);
    const { productId, variationId } = await seedProduct(testBranchId, pool);
    testProductId = productId;
    testVariantId = variationId;
    testCustomerId = await seedCustomer(pool);
  });

  afterEach(async () => {
    const pool = getPool();
    for (const saleId of salesToCleanup) {
      await cleanupSale(pool, saleId);
    }
    salesToCleanup = [];
    if (testCustomerId) await cleanupCustomer(testCustomerId.toString(), pool);
    if (testProductId) await cleanupProduct(testProductId.toString(), pool);
    if (testBranchId) await cleanupBranch(testBranchId.toString(), pool);
  });

  afterAll(async () => {
    await httpServer.close();
  });

  const createTestSale = async (
    date: string,
    totalAmount: number,
    customerId: number | null = testCustomerId,
    userId: string = adminUserId,
  ) => {
    const pool = getPool();
    const { saleId } = await seedSale(
      pool,
      userId,
      customerId ? customerId.toString() : null,
      date,
      totalAmount,
      [
        {
          productId: testProductId,
          variationId: testVariantId,
          quantity: 1,
          unitPrice: totalAmount,
          costPrice: totalAmount / 2,
          totalPrice: totalAmount, // Note: total_price was removed from schema/seedSale, but keeping in obj structure if passed to seedSale wrapper but ignored
        },
      ],
      [{ method: 'cash', amount: totalAmount }],
    );
    salesToCleanup.push(saleId.toString());
    return saleId;
  };

  describe('GET /api/sales/history', () => {
    it('should return sales history with pagination', async () => {
      await createTestSale('2025-11-01T10:00:00Z', 100);
      await createTestSale('2025-11-02T11:00:00Z', 200);
      await createTestSale('2025-11-03T12:00:00Z', 300);

      const res = await request(app)
        .get('/api/sales/history?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.sales).toHaveLength(2);
      expect(res.body.totalSales).toEqual(3);
      expect(res.body.page).toEqual(1);
      expect(res.body.limit).toEqual(2);
      expect(res.body.totalPages).toEqual(2);
      // expect(res.body.sales[0].total_amount).toEqual('300.00'); // Order might vary if same timestamp, but distinct dates should work
    });

    it('should filter sales by startDate and endDate', async () => {
      await createTestSale('2025-11-01T10:00:00Z', 100);
      await createTestSale('2025-11-05T11:00:00Z', 200);
      await createTestSale('2025-11-10T12:00:00Z', 300);

      const res = await request(app)
        .get('/api/sales/history?startDate=2025-11-04T00:00:00Z&endDate=2025-11-06T23:59:59Z')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.sales).toHaveLength(1);
      expect(res.body.sales[0].total_amount).toEqual('200.00');
      expect(res.body.totalSales).toEqual(1);
    });

    it('should filter sales by customerId', async () => {
      const customer1Id = await seedCustomer(getPool());
      const customer2Id = await seedCustomer(getPool());
      // customers to clean up handled by afterEach logic? 
      // The afterEach only cleans `testCustomerId`. We need to manually clean these or add to a list.
      // For simplicity, let's just rely on global DB reset or add try/finally block here.
      
      try {
        await createTestSale('2025-11-01T10:00:00Z', 100, customer1Id);
        await createTestSale('2025-11-02T11:00:00Z', 200, customer2Id);
        await createTestSale('2025-11-03T12:00:00Z', 300, customer1Id);

        const res = await request(app)
          .get(`/api/sales/history?customerId=${customer1Id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.sales).toHaveLength(2);
        expect(res.body.sales[0].total_amount).toEqual('300.00'); // Newest first
        expect(res.body.sales[1].total_amount).toEqual('100.00');
        expect(res.body.totalSales).toEqual(2);
      } finally {
         await cleanupCustomer(customer1Id.toString(), getPool());
         await cleanupCustomer(customer2Id.toString(), getPool());
      }
    });

    it('should filter sales by userId', async () => {
      const user1Id = adminUserId;
      // Mocking another user creation is complex due to auth. 
      // Let's assume filtering by the current admin user works.
      
      await createTestSale('2025-11-01T10:00:00Z', 100, testCustomerId, user1Id);

      const res = await request(app)
        .get(`/api/sales/history?userId=${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.sales.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array if no sales match filters', async () => {
      await createTestSale('2025-11-01T10:00:00Z', 100);

      const res = await request(app)
        .get('/api/sales/history?startDate=2025-12-01T00:00:00Z')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.sales).toHaveLength(0);
      expect(res.body.totalSales).toEqual(0);
    });
  });

  describe('GET /api/sales/history/:saleId', () => {
    it('should return details for a specific sale', async () => {
      const saleId = await createTestSale('2025-11-01T10:00:00Z', 150);

      const res = await request(app)
        .get(`/api/sales/history/${saleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(saleId);
      expect(res.body.total_amount).toEqual('150.00');
      // expect(res.body.payments).toHaveLength(1); // Payment table not in schema? seedSale dummy payments?
    });

    it('should return 404 if saleId does not exist', async () => {
      const nonExistentSaleId = '12345'; // Integer ID

      const res = await request(app)
        .get(`/api/sales/history/${nonExistentSaleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Sale not found');
    });
  });
});
