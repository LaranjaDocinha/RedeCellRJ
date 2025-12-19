import { dynamicPricingService } from '../../../src/services/dynamicPricingService';
import { vi } from 'vitest';

vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  return {
    default: {
      query: mockQuery,
    },
    __esModule: true,
  };
});

describe('dynamicPricingService', () => {
  let mockedDb: any;

  beforeAll(async () => {
    mockedDb = vi.mocked(await import('../../../src/db/index.js'));
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getSuggestedUsedProductPrice', () => {
    it('should return null if product is not found or not a used product', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [] });

      const price = await dynamicPricingService.getSuggestedUsedProductPrice(1);

      expect(price).toBeNull();
      expect(mockedDb.default.query).toHaveBeenCalledWith(
        'SELECT p.acquisition_date, p.condition, p.created_at, pv.price as new_price FROM products p JOIN product_variations pv ON p.id = pv.product_id WHERE p.id = $1 AND p.is_used = TRUE LIMIT 1',
        [1],
      );
    });

    it('should calculate the price correctly for an "Excelente" condition product with no time in stock', async () => {
      const now = new Date(2023, 10, 17);
      vi.setSystemTime(now);
      const product = {
        acquisition_date: now.toISOString(),
        condition: 'Excelente',
        created_at: now.toISOString(),
        new_price: '1000.00',
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [product] });

      const price = await dynamicPricingService.getSuggestedUsedProductPrice(1);

      expect(price).toBeCloseTo(950.0);
    });

    it('should calculate the price correctly for a "Bom" condition product with 1 month in stock', async () => {
      const now = new Date(2023, 10, 17);
      const acquisitionDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      vi.setSystemTime(now);
      const product = {
        acquisition_date: acquisitionDate.toISOString(),
        condition: 'Bom',
        created_at: acquisitionDate.toISOString(),
        new_price: '1000.00',
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [product] });

      const price = await dynamicPricingService.getSuggestedUsedProductPrice(1);

      expect(price).toBeCloseTo(760.0); // 1000 * 0.80 * (1 - 0.05)
    });

    it('should calculate the price correctly for a "Regular" condition product', async () => {
      const now = new Date(2023, 10, 17);
      vi.setSystemTime(now);
      const product = {
        acquisition_date: now.toISOString(),
        condition: 'Regular',
        created_at: now.toISOString(),
        new_price: '1000.00',
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [product] });

      const price = await dynamicPricingService.getSuggestedUsedProductPrice(1);

      expect(price).toBeCloseTo(600.0);
    });

    it('should calculate the price correctly for an unknown condition product', async () => {
      const now = new Date(2023, 10, 17);
      vi.setSystemTime(now);
      const product = {
        acquisition_date: now.toISOString(),
        condition: 'Desconhecida',
        created_at: now.toISOString(),
        new_price: '1000.00',
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [product] });

      const price = await dynamicPricingService.getSuggestedUsedProductPrice(1);

      expect(price).toBeCloseTo(700.0);
    });

    it('should apply the minimum price limit', async () => {
      const now = new Date(2023, 10, 17);
      const acquisitionDate = new Date(2021, 10, 17); // 2 years ago
      vi.setSystemTime(now);
      const product = {
        acquisition_date: acquisitionDate.toISOString(),
        condition: 'Regular', // 60% discount
        created_at: acquisitionDate.toISOString(),
        new_price: '1000.00',
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [product] });

      const price = await dynamicPricingService.getSuggestedUsedProductPrice(1);

      // Price would be 1000 * 0.6 * (1 - (24 * 0.05)) = 600 * (1 - 1.2) = -120
      // So it should be clamped to the minimum price of 300
      expect(price).toBe(300.0);
    });

    it('should use created_at when acquisition_date is null', async () => {
      const now = new Date(2023, 10, 17);
      const createdAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      vi.setSystemTime(now);
      const product = {
        acquisition_date: null,
        condition: 'Bom',
        created_at: createdAt.toISOString(),
        new_price: '1000.00',
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [product] });

      const price = await dynamicPricingService.getSuggestedUsedProductPrice(1);

      expect(price).toBeCloseTo(760.0);
    });
  });
});
