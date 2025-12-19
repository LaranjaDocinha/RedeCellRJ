import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as hardwareService from '../../../src/services/hardwareService.js';

describe('HardwareService', () => {
  describe('simulateScaleReading', () => {
    it('should return a weight between 0.1 and 5', async () => {
      const weight = await hardwareService.simulateScaleReading();
      expect(weight).toBeGreaterThanOrEqual(0.1);
      expect(weight).toBeLessThanOrEqual(5);
    });
  });

  describe('processTefPayment', () => {
    it('should approve a transaction successfully when random is high', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.1 success
      const result = await hardwareService.processTefPayment(100, 'credit');
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.message).toBe('Transação TEF aprovada com sucesso.');
      vi.restoreAllMocks();
    });

    it('should deny a transaction when random is low', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.05); // < 0.1 failure
      const result = await hardwareService.processTefPayment(100, 'debit');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Transação TEF negada. Tente novamente.');
      vi.restoreAllMocks();
    });
  });
});