import { describe, it, expect } from 'vitest';
import * as arService from '../../../src/services/arService';

describe('ARService', () => {
  describe('getCompatibleProducts', () => {
    it('should return compatible products', async () => {
      const result = await arService.getCompatibleProducts(1);
      expect(result.success).toBe(true);
      expect(result.products).toHaveLength(2);
    });
  });

  describe('logARInteraction', () => {
    it('should log interaction', async () => {
      const result = await arService.logARInteraction(1, 1);
      expect(result.success).toBe(true);
    });
  });
});
