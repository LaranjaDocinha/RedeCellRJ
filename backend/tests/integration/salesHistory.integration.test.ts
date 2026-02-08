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
    const pool = getPool();

    // Clean up to avoid data pollution
    await pool.query('TRUNCATE sales RESTART IDENTITY CASCADE'); // Cascades to items, payments, commissions

    const res = await request(app) // Using app instead of httpServer for supertest usually works better unless server specific logic
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });

    adminToken = res.body.data.accessToken;

    const adminUserResult: any = await getAdminUserId();

    adminUserId =
      adminUserResult && typeof adminUserResult === 'object' ? adminUserResult.id : adminUserResult;
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
    for (const saleId of salesToCleanup) {
      await cleanupSale(saleId);
    }
    salesToCleanup = [];
    if (testCustomerId) await cleanupCustomer(testCustomerId.toString());
    if (testProductId) await cleanupProduct(testProductId.toString());
    if (testBranchId) await cleanupBranch(testBranchId.toString());
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
    const { saleId } = await seedSale({
      client: pool,
      userId,
      customerId: customerId ? customerId.toString() : null,
      saleDate: new Date(date),
      totalAmount,
      items: [
        {
          productId: testProductId,
          variationId: testVariantId,
          quantity: 1,
          unitPrice: totalAmount,
          costPrice: totalAmount / 2,
        },
      ],
      payments: [{ method: 'cash', amount: totalAmount }],
    });
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
      expect(res.body.data.sales).toHaveLength(2);
      expect(res.body.data.totalSales).toEqual(3);
      expect(res.body.data.page).toEqual(1);
      expect(res.body.data.limit).toEqual(2);
      expect(res.body.data.totalPages).toEqual(2);
    });

    it('should filter sales by startDate and endDate', async () => {
      await createTestSale('2025-11-01T10:00:00Z', 100);
      await createTestSale('2025-11-05T11:00:00Z', 200);
      await createTestSale('2025-11-10T12:00:00Z', 300);

      const res = await request(app)
        .get('/api/sales/history?startDate=2025-11-04T00:00:00Z&endDate=2025-11-06T23:59:59Z')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.sales).toHaveLength(1);
      expect(res.body.data.sales[0].total_amount).toEqual('200.00');
      expect(res.body.data.totalSales).toEqual(1);
    });

    it('should filter sales by customerId', async () => {
      const customer1Id = await seedCustomer(getPool());
      const customer2Id = await seedCustomer(getPool());

      try {
        await createTestSale('2025-11-01T10:00:00Z', 100, customer1Id);
        await createTestSale('2025-11-02T11:00:00Z', 200, customer2Id);
        await createTestSale('2025-11-03T12:00:00Z', 300, customer1Id);

        const res = await request(app)
          .get(`/api/sales/history?customerId=${customer1Id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.sales).toHaveLength(2);
        expect(res.body.data.sales[0].total_amount).toEqual('300.00'); // Newest first
        expect(res.body.data.sales[1].total_amount).toEqual('100.00');
        expect(res.body.data.totalSales).toEqual(2);
      } finally {
        await cleanupCustomer(customer1Id.toString(), getPool());
        await cleanupCustomer(customer2Id.toString(), getPool());
      }
    });

    it('should filter sales by userId', async () => {
      const user1Id = adminUserId;

      await createTestSale('2025-11-01T10:00:00Z', 100, testCustomerId, user1Id);

      const res = await request(app)
        .get(`/api/sales/history?userId=${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.sales.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array if no sales match filters', async () => {
      await createTestSale('2025-11-01T10:00:00Z', 100);

      const res = await request(app)
        .get('/api/sales/history?startDate=2099-01-01T00:00:00Z')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.sales).toHaveLength(0);
      expect(res.body.data.totalSales).toEqual(0);
    });
  });

  describe('GET /api/sales/history/:saleId', () => {
    it('should return details for a specific sale', async () => {
      const saleId = await createTestSale('2025-11-01T10:00:00Z', 150);

      const res = await request(app)
        .get(`/api/sales/history/${saleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.id).toEqual(saleId);
      expect(res.body.data.total_amount).toEqual('150.00');
    });

    it('should return 404 if saleId does not exist', async () => {
      const nonExistentSaleId = '12345'; // Integer ID

      const res = await request(app)
        .get(`/api/sales/history/${nonExistentSaleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.data.message).toEqual('Sale not found');
    });
  });
});
