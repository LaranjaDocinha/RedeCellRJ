import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { pixService } from '../../src/services/pixService.js';
import { getAdminAuthToken } from '../utils/auth.js';

describe('PIX Integration API', () => {
  let adminToken: string;

  beforeEach(async () => {
    adminToken = await getAdminAuthToken();
    vi.spyOn(pixService, 'generateDynamicQrCode').mockResolvedValue({
      qrCodeBase64: 'mocked_qr_code_data',
      pixCopiaECola: 'mocked_copia_e_cola',
      transactionId: 'mocked_pix_transaction_id',
      status: 'pending',
    });
    vi.spyOn(pixService, 'handleWebhook').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/pix/generate-qr', () => {
    it('should generate a dynamic PIX QR code for a valid amount', async () => {
      const res = await request(app)
        .post('/api/pix/generate-qr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 100.5, description: 'Test Payment' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.qrCodeBase64).toBeDefined();
      expect(pixService.generateDynamicQrCode).toHaveBeenCalled();
    });

    it('should return 400 for an invalid amount (zero)', async () => {
      const res = await request(app)
        .post('/api/pix/generate-qr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 0 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.data.message).toEqual('Validation failed');
      expect(JSON.stringify(res.body.data.errors)).toMatch(
        /Amount must be positive|Valor deve ser positivo/,
      );
    });
  });

  describe('POST /api/pix/webhook', () => {
    it('should successfully receive and process a PIX webhook', async () => {
      const webhookData = {
        event: 'payment_received',
        transactionId: 'some_pix_transaction_id',
        amount: 100,
      };

      const res = await request(app).post('/api/pix/webhook').send(webhookData);

      expect(res.statusCode).toEqual(200);
      expect(pixService.handleWebhook).toHaveBeenCalled();
    });
  });
});
