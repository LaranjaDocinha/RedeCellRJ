import { dashboardService } from '../../src/services/dashboardService.js';
import { vi } from 'vitest';

// Mock ../db/index.js
vi.mock('../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    query: mockQuery,
    connect: vi.fn(() => Promise.resolve(mockClient)),
  };

  return {
    __esModule: true,
    default: mockPool,
    query: mockQuery,
  };
});

describe('dashboardService', () => {
  let mockedDb: any;

  beforeAll(async () => {
    mockedDb = vi.mocked(await import('../../src/db/index.js'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockedDb.query.mockClear();
  });

  describe('getTotalSalesAmount', () => {
    it('should return the total sales amount', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [{ total_sales: '1234.56' }] });

      const totalSales = await dashboardService.getTotalSalesAmount();

      expect(totalSales).toEqual({
        mainPeriodSales: 1234.56,
        comparisonPeriodSales: null,
      });
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.any(Array),
      );
    });

    it('should return 0 if no sales are found', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [{ total_sales: '0' }] });

      const totalSales = await dashboardService.getTotalSalesAmount();

      expect(totalSales).toEqual({
        mainPeriodSales: 0,
        comparisonPeriodSales: null,
      });
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.any(Array),
      );
    });
  });

  describe('getSalesByMonth', () => {
    it('should return monthly sales data', async () => {
      const mockMonthlySales = [
        { month: '2023-01', monthly_sales: '100.00' },
        { month: '2023-02', monthly_sales: '200.50' },
      ];
      mockedDb.query.mockResolvedValueOnce({ rows: mockMonthlySales });

      const salesByMonth = await dashboardService.getSalesByMonth();

      expect(salesByMonth).toEqual({
        mainPeriodSalesByMonth: [
          { month: '2023-01', monthly_sales: 100.0 },
          { month: '2023-02', monthly_sales: 200.5 },
        ],
        comparisonPeriodSalesByMonth: null,
      });
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.any(Array),
      );
    });

    it('should return an empty array if no sales are found', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [] });

      const salesByMonth = await dashboardService.getSalesByMonth();

      expect(salesByMonth).toEqual({
        mainPeriodSalesByMonth: [],
        comparisonPeriodSalesByMonth: null,
      });
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.any(Array),
      );
    });
  });

  describe('getTopSellingProducts', () => {
    it('should return top-selling products', async () => {
      const mockTopProducts = [
        { product_name: 'Product X', variation_color: 'Red', total_quantity_sold: '100' },
        { product_name: 'Product Y', variation_color: 'Blue', total_quantity_sold: '50' },
      ];
      mockedDb.query.mockResolvedValueOnce({ rows: mockTopProducts });

      const topProducts = await dashboardService.getTopSellingProducts();

      expect(topProducts).toEqual({
        mainPeriodTopSellingProducts: [
          { product_name: 'Product X', variation_color: 'Red', total_quantity_sold: 100 },
          { product_name: 'Product Y', variation_color: 'Blue', total_quantity_sold: 50 },
        ],
        comparisonPeriodTopSellingProducts: null,
      });
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [5], // Default limit
      );
    });

    it('should use the provided limit', async () => {
      const mockTopProducts = [
        { product_name: 'Product Z', variation_color: 'Green', total_quantity_sold: '200' },
      ];
      mockedDb.query.mockResolvedValueOnce({ rows: mockTopProducts });

      const topProducts = await dashboardService.getTopSellingProducts({}, 1);

      expect(topProducts).toEqual({
        mainPeriodTopSellingProducts: [
          { product_name: 'Product Z', variation_color: 'Green', total_quantity_sold: 200 },
        ],
        comparisonPeriodTopSellingProducts: null,
      });
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1], // Provided limit
      );
    });
  });
});