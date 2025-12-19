import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';
import { pixService } from '../../src/services/pixService';

// Mock the pixService to prevent actual external API calls during tests
vi.mock('../../src/services/pixService', () => ({
  pixService: {
    generateDynamicQrCode: vi.fn((requestData) => ({
      qrCodeBase64: 'dummy_base64_qr_code',
      pixCopiaECola: `dummy_pix_copia_e_cola_for_${requestData.amount}`,
      transactionId: requestData.transactionId,
      status: 'pending',
    })),
    handleWebhook: vi.fn(() => Promise.resolve()),
  },
}));

describe('PIX Integration API', () => {
  let adminToken: string;
  let server: any;


  setupTestCleanup();

  beforeAll(async () => {
    server = httpServer.listen(4000); // Start the server for tests
    const pool = getPool();
    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.token;
  });

  afterAll(async () => {
    await server.close(); // Close the server after all tests
  });

  describe('POST /api/pix/generate-qr', () => {
    it('should generate a dynamic PIX QR code for a valid amount', async () => {
      const amount = 100.5;
      const res = await request(app)
        .post('/api/pix/generate-qr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('qrCodeBase64');
      expect(res.body).toHaveProperty('pixCopiaECola');
      expect(res.body).toHaveProperty('transactionId');
      expect(res.body.status).toEqual('pending');
      expect(pixService.generateDynamicQrCode).toHaveBeenCalledWith(
        expect.objectContaining({ amount }),
      );
    });

    it('should return 400 for an invalid amount (zero)', async () => {
      const res = await request(app)
        .post('/api/pix/generate-qr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 0 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
    });

    it('should return 400 for an invalid amount (negative)', async () => {
      const res = await request(app)
        .post('/api/pix/generate-qr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: -10 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/pix/generate-qr').send({ amount: 50 });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/pix/webhook', () => {
    it('should successfully receive and process a PIX webhook', async () => {
      const webhookPayload = {
        event: 'payment_received',
        transactionId: 'some_pix_transaction_id',
        amount: 100.0,
        // ... other PIX webhook data
      };

      const res = await request(app).post('/api/pix/webhook').send(webhookPayload);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Webhook received and processed');
      expect(pixService.handleWebhook).toHaveBeenCalledWith(webhookPayload);
    });
  });
});
