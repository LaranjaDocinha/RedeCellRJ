import { describe, it, expect, vi } from 'vitest';
import { competitorPriceService } from '../../../src/services/competitorPriceService.js';

describe('CompetitorPriceService', () => {
  describe('getMarketSuggestions', () => {
    it('should return suggestions for given variation IDs', async () => {
      const variationIds = [1, 2, 3];
      const result = await competitorPriceService.getMarketSuggestions(variationIds);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('suggestion');
      expect(result[0]).toHaveProperty('diffPercent');
    });

    it('should return empty array if no IDs provided', async () => {
      const result = await competitorPriceService.getMarketSuggestions([]);
      expect(result).toHaveLength(0);
    });
  });
});
