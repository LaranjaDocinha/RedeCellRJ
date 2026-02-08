import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tefService } from '../../../src/services/tefService.js';
import { AppError } from '../../../src/utils/errors.js';

describe('TefService', () => {
  describe('processTefTransaction', () => {
    it('should approve a transaction successfully', async () => {
      const transactionData = {
        transactionId: 'tef-123',
        amount: 100.5,
        paymentMethod: 'credit_card' as const,
        status: 'pending' as const,
      };

      const result = await tefService.processTefTransaction(transactionData);

      expect(result.status).toBe('approved');
      expect(result.transactionId).toBe(transactionData.transactionId);
    });

    it('should throw AppError if transaction status is denied', async () => {
      const transactionData = {
        transactionId: 'tef-456',
        amount: 50.0,
        paymentMethod: 'debit_card' as const,
        status: 'denied' as const,
      };

      await expect(tefService.processTefTransaction(transactionData)).rejects.toThrow(AppError);
      await expect(tefService.processTefTransaction(transactionData)).rejects.toThrow(
        'TEF Transaction denied',
      );
    });
  });

  describe('getTefTransactionStatus', () => {
    it('should return approved when Math.random is high', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const status = await tefService.getTefTransactionStatus('tef-123');
      expect(status).toBe('approved');
      vi.restoreAllMocks();
    });

    it('should return pending when Math.random is low', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const status = await tefService.getTefTransactionStatus('tef-123');
      expect(status).toBe('pending');
      vi.restoreAllMocks();
    });
  });
});
