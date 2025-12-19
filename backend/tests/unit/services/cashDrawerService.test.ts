import { describe, it, expect } from 'vitest';
import { cashDrawerService } from '../../../src/services/cashDrawerService';

describe('CashDrawerService', () => {
  describe('openCashDrawer', () => {
    it('should return success message', async () => {
      const result = await cashDrawerService.openCashDrawer();
      expect(result.message).toContain('simulated successfully');
    });
  });
});
