import { describe, it, expect } from 'vitest';
import * as carrierService from '../../../src/services/carrierApiService';

describe('CarrierApiService', () => {
  describe('activateChip', () => {
    it('should return success', async () => {
      const result = await carrierService.activateChip({}, {}, 'Vivo');
      expect(result.success).toBe(true);
    });
  });

  describe('activatePlan', () => {
    it('should return success', async () => {
      const result = await carrierService.activatePlan({}, {}, 'Claro');
      expect(result.success).toBe(true);
    });
  });

  describe('getCarrierStatus', () => {
    it('should return status', async () => {
      const result = await carrierService.getCarrierStatus('TIM');
      expect(result.status).toBe('Connected');
    });
  });
});
