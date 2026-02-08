import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pixService } from '../../../src/services/pixService.js';
import qrcode from 'qrcode';
import appEvents from '../../../src/events/appEvents.js';

vi.mock('qrcode');
vi.mock('../../../src/events/appEvents.js', () => ({
  default: {
    emit: vi.fn(),
  },
}));

describe('PixService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateStaticPix', () => {
    it('should generate a static PIX QR code', async () => {
      vi.mocked(qrcode.toDataURL).mockResolvedValue('data:image/png;base64,mocked-qr-code');

      const result = await pixService.generateStaticPix(100.5, 'Test Payment');

      expect(result.copyAndPaste).toContain('100.50');
      expect(result.qrCode).toBe('data:image/png;base64,mocked-qr-code');
      expect(qrcode.toDataURL).toHaveBeenCalled();
    });
  });

  describe('generateDynamicQrCode', () => {
    it('should generate a dynamic QR code payload', async () => {
      vi.mocked(qrcode.toDataURL).mockResolvedValue('data:image/png;base64,mocked-qr-code');

      const request = {
        amount: 100,
        transactionId: 'txn-123',
        description: 'Test Payment',
      };

      const result = await pixService.generateDynamicQrCode(request);

      expect(result.qrCodeBase64).toBe('data:image/png;base64,mocked-qr-code');
      expect(result.pixCopiaECola).toContain('100.00');
      expect(result.txid).toBe('txn-123');
    });
  });

  describe('checkPaymentStatus', () => {
    it('should return a valid status', async () => {
      const status = await pixService.checkPaymentStatus('txn-123');
      expect(['pending', 'paid', 'expired']).toContain(status);
    });
  });

  describe('handleWebhook', () => {
    it('should handle webhook payload', async () => {
      const payload = { txid: 'txn-123', status: 'paid' };

      await pixService.handleWebhook(payload);

      expect(appEvents.emit).toHaveBeenCalledWith('pix.payment.confirmed', {
        transactionId: 'txn-123',
      });
    });
  });
});
