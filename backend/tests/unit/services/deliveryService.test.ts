import { describe, it, expect, vi } from 'vitest';
import { deliveryService } from '../../../src/services/deliveryService.js';

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn() },
}));

describe('DeliveryService', () => {
  describe('getQuote', () => {
    it('should return simulated quotes', async () => {
      const res = await deliveryService.getQuote('123', '456');
      expect(res).toHaveLength(3);
      expect(res[0].provider).toBe('Lalamove');
    });
  });

  describe('requestDelivery', () => {
    it('should return simulated tracking info', async () => {
      const res = await deliveryService.requestDelivery(1, 'Loggi', '123');
      expect(res.trackingId).toMatch(/^TRK-/);
      expect(res.status).toBe('BUSCANDO_MOTOBOY');
    });
  });
});
