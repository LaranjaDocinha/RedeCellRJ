import { describe, it, expect } from 'vitest';
import { logisticsService } from '../../../src/services/logisticsService.js';

describe('LogisticsService', () => {
  describe('calculateShipping', () => {
    it('should return simulated shipping options', async () => {
      const result = await logisticsService.calculateShipping('12345-678', 1.5);
      expect(result).toHaveLength(3);
      expect(result[0].carrier).toBe('Correios');
    });
  });

  describe('generateLabel', () => {
    it('should return simulated tracking code and label URL', async () => {
      const result = await logisticsService.generateLabel(1, 'SEDEX');
      expect(result.trackingCode).toMatch(/^BR/);
      expect(result.labelUrl).toContain(result.trackingCode);
    });
  });
});
