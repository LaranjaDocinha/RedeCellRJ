import { describe, it, expect, vi, beforeEach } from 'vitest';
import { demandForecastingService } from '../../../src/services/demandForecastingService.js';
import pool from '../../../src/db/index.js';

// Precisamos mockar o db index ANTES da importação se possível,
// mas como demandForecastingService já foi carregado, vamos usar vi.spyOn
describe('DemandForecastingService (ABC Intelligence)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly classify products into A, B and C categories', async () => {
    const mockABCResult = {
      rows: [
        { product_id: 1, name: 'iPhone 15', total_revenue: 8000, share: 80, cumulative_share: 80 },
        {
          product_id: 2,
          name: 'Capa Silicone',
          total_revenue: 1500,
          share: 15,
          cumulative_share: 95,
        },
        { product_id: 3, name: 'Película', total_revenue: 500, share: 5, cumulative_share: 100 },
      ],
    };

    vi.spyOn(pool, 'query').mockResolvedValueOnce(mockABCResult as any);

    const result = await demandForecastingService.getABCAnalysis();

    expect(result[0].classification).toBe('A');
    expect(result[1].classification).toBe('B');
    expect(result[2].classification).toBe('C');
  });

  it('should suggest 45 days of cover for Class A items and only 15 for Class C', async () => {
    // 1. Mock ABC Analysis Call inside suggestions
    vi.spyOn(demandForecastingService, 'getABCAnalysis').mockResolvedValue([
      {
        productId: 1,
        productName: 'A-Item',
        revenue: 1000,
        share: 80,
        cumulativeShare: 80,
        classification: 'A',
      },
      {
        productId: 2,
        productName: 'C-Item',
        revenue: 10,
        share: 1,
        cumulativeShare: 100,
        classification: 'C',
      },
    ]);

    // 2. Mock Pool Client for consumption query
    const mockClient = {
      query: vi.fn().mockResolvedValue({
        rows: [
          { product_id: 1, product_name: 'A-Item', current_stock: 10, avg_consumption: 70 }, // 10 units stock, 10/day cons
          { product_id: 2, product_name: 'C-Item', current_stock: 5, avg_consumption: 7 }, // 5 units stock, 1/day cons
        ],
      }),
      release: vi.fn(),
    };
    vi.spyOn(pool, 'connect').mockResolvedValue(mockClient as any);

    const suggestions = await demandForecastingService.getPurchaseSuggestions();

    const aSuggestion = suggestions.find((s) => s.productId === 1);
    const cSuggestion = suggestions.find((s) => s.productId === 2);

    // Item A: Consumo 10/dia. Alvo 45 dias = 450 un. Tem 10. Sugere 440.
    expect(aSuggestion?.suggestedQuantity).toBe(440);
    expect(aSuggestion?.classification).toBe('A');

    // Item C: Consumo 1/dia. Alvo 15 dias = 15 un. Tem 5. Sugere 10.
    expect(cSuggestion?.suggestedQuantity).toBe(10);
    expect(cSuggestion?.classification).toBe('C');
  });
});
