import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';
import { seedSale, cleanupSale } from '../utils/seedTestData';
import nodemailer from 'nodemailer';

// Mock nodemailer to prevent actual email sending during tests
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(() => Promise.resolve({ messageId: 'mock-message-id' })),
    })),
  },
}));

describe('Receipts API', () => {
  let adminToken: string;
  let server: any;
  let testSaleId: string;
  let testCustomerId: string;
  let testProductId: string;
  let testVariantId: string;
  let testBranchId: number;


  setupTestCleanup();

  beforeAll(async () => {
    server = httpServer.listen(4002); // Start the server for tests
    const pool = getPool();
    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.token;

    // Seed a test sale
    const seedData = await seedSale(pool);
    testSaleId = seedData.saleId;
    testCustomerId = seedData.customerId;
    testProductId = seedData.productId;
    testVariantId = seedData.variantId;
    testBranchId = seedData.branchId;
  });

  afterAll(async () => {
    const pool = getPool();
    await cleanupSale(pool, testSaleId, testCustomerId, testProductId, testVariantId, testBranchId);
    await server.close(); // Close the server after all tests
  });

  describe('GET /api/receipts/:saleId/receipt', () => {
    it('should successfully generate a receipt for an existing sale', async () => {
      const res = await request(app)
        .get(`/api/receipts/${testSaleId}/receipt`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('RECIBO DE VENDA');
      expect(res.text).toContain(`ID da Venda: ${testSaleId}`);
      expect(res.text).toContain('Total: R$');
    });

    it('should return 404 for a non-existent sale ID', async () => {
      const nonExistentSaleId = uuidv4();
      const res = await request(app)
        .get(`/api/receipts/${nonExistentSaleId}/receipt`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Sale not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get(`/api/receipts/${testSaleId}/receipt`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/receipts/:saleId/fiscal-note', () => {
    it('should successfully generate a fiscal note for an existing sale', async () => {
      const res = await request(app)
        .post(`/api/receipts/${testSaleId}/fiscal-note`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('NOTA FISCAL (SIMULADA)');
      expect(res.text).toContain(`ID da Venda Associada: ${testSaleId}`);
      expect(res.text).toContain('Valor Total: R$');
    });

    it('should return 404 for a non-existent sale ID', async () => {
      const nonExistentSaleId = uuidv4();
      const res = await request(app)
        .post(`/api/receipts/${nonExistentSaleId}/fiscal-note`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Sale not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post(`/api/receipts/${testSaleId}/fiscal-note`);

      expect(res.statusCode).toEqual(401);
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
      expect(res.body.message).toEqual('Email sent successfully');
      // Verify that nodemailer's sendMail was called
      const transporter = nodemailer.createTransport();
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.htmlContent,
          text: emailData.textContent,
        }),
      );
    });

    it('should return 400 for invalid email data (empty subject)', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: '',
        htmlContent: '<h1>Test Receipt</h1>',
        textContent: 'Test Receipt',
      };

      const res = await request(app)
        .post('/api/receipts/send-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(emailData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Receipt',
        htmlContent: '<h1>Test Receipt</h1>',
        textContent: 'Test Receipt',
      };

      const res = await request(app).post('/api/receipts/send-email').send(emailData);

      expect(res.statusCode).toEqual(401);
    });
  });
});
