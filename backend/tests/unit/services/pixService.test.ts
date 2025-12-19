import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import qrcode from 'qrcode';

// Mock do qrcode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    connect: mockConnect,
    query: mockQuery,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

import { pixService } from '../../../src/services/pixService.js';

describe('PixService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (qrcode.toDataURL as any).mockResolvedValue('data:image/png;base64,mocked-qr-code');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateDynamicQrCode', () => {
    it('should generate a dynamic QR code payload', async () => {
      const request = {
        amount: 100.00,
        transactionId: 'txn-123',
        description: 'Test Payment'
      };

      const result = await pixService.generateDynamicQrCode(request);

      expect(result.qrCodeBase64).toBe('data:image/png;base64,mocked-qr-code');
      expect(result.pixCopiaECola).toContain('txn-123');
      expect(result.pixCopiaECola).toContain('100.00');
      expect(result.transactionId).toBe('txn-123');
      expect(result.status).toBe('pending');
      expect(qrcode.toDataURL).toHaveBeenCalledWith(result.pixCopiaECola);
    });
  });

  describe('checkPaymentStatus', () => {
    it('should return a valid status', async () => {
      // Como o status é random, vamos rodar algumas vezes e verificar se está no array esperado
      const status = await pixService.checkPaymentStatus('txn-123');
      expect(['pending', 'paid', 'expired']).toContain(status);
    });
  });

  describe('handleWebhook', () => {
    it('should handle webhook payload', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const payload = { transactionId: 'txn-123', status: 'paid' };
      
      await pixService.handleWebhook(payload);
      
      expect(consoleSpy).toHaveBeenCalledWith('Received PIX webhook:', payload);
      consoleSpy.mockRestore();
    });
  });
});
