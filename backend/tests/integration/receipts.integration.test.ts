import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db/index.js';
import {
  seedSale,
  seedBranch,
  seedCustomer,
  seedProduct,
  getAdminUserId,
} from '../utils/seedTestData.js';
import { receiptService } from '../../src/services/receiptService.js';
import { getAdminAuthToken } from '../utils/auth.js';

describe('Receipts API', () => {
  let adminToken: string;
  let testSaleId: string | number;

  beforeEach(async () => {
    adminToken = await getAdminAuthToken();
    const pool = getPool();
    const branchId = await seedBranch(pool);
    const customerId = await seedCustomer(pool);
    const product = await seedProduct(branchId, pool);
    const adminId = await getAdminUserId(pool);

    const seedData = await seedSale({
      client: pool,
      userId: adminId!,
      customerId: String(customerId),
      saleDate: new Date(),
      totalAmount: 100,
      items: [
        {
          productId: product.productId,
          variationId: product.variationId,
          quantity: 1,
          unitPrice: 100,
          costPrice: 50,
        },
      ],
      payments: [{ method: 'cash', amount: 100 }],
    });
    testSaleId = seedData.saleId;
    vi.spyOn(receiptService, 'sendDocumentByEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/receipts/:saleId/receipt', () => {
    it('should successfully generate a receipt for an existing sale', async () => {
      const res = await request(app)
        .get(`/api/receipts/${testSaleId}/receipt`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('RECIBO');
    });

    it('should return 404 for a non-existent sale ID', async () => {
      const res = await request(app)
        .get(`/api/receipts/999999/receipt`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/receipts/:saleId/fiscal-note', () => {
    it('should successfully generate a fiscal note for an existing sale', async () => {
      const res = await request(app)
        .post(`/api/receipts/${testSaleId}/fiscal-note`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('NOTA FISCAL');
    });
  });

  describe('POST /api/receipts/send-email', () => {
    it('should successfully send an email with valid data', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Receipt',
        htmlContent: '<h1>Test Receipt</h1>',
        textContent: 'Test Receipt',
      };

      const res = await request(app)
        .post('/api/receipts/send-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(emailData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.message).toEqual('Email sent successfully');
    });
  });
});
