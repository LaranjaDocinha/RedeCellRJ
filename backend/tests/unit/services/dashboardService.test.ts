import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  const mockRelease = vi.fn();
  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };
  const mockConnect = vi.fn().mockResolvedValue(mockClient);
  const mockPool = {
    query: mockQuery,
    connect: mockConnect,
  };
  
  return {
    default: mockPool,
    getPool: () => mockPool,
    // Exportar para controle nos testes
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool
  };
});

// Importar o serviço APÓS o mock
import { dashboardService } from '../../../src/services/dashboardService.js';

describe('DashboardService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    // Importar as referências dos mocks
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;
    
    vi.clearAllMocks();
    
    // Define um comportamento padrão seguro para query
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    
    // Resetar outros mocks
    mockConnect.mockResolvedValue((dbModule as any)._mockClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTotalSalesAmount', () => {
    it('should return total sales for the main period (no comparison)', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_sales: '1500.50' }],
        rowCount: 1,
      });

      const filters = { period: 'thisMonth' };
      const result = await dashboardService.getTotalSalesAmount(filters);

      expect(result).toEqual({ mainPeriodSales: 1500.50, comparisonPeriodSales: null });
      expect(mockQuery).toHaveBeenCalledTimes(1); // Apenas a query principal
    });

    it('should return total sales with comparison period (previousPeriod)', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total_sales: '2000.00' }], rowCount: 1 }) // Main
        .mockResolvedValueOnce({ rows: [{ total_sales: '1800.00' }], rowCount: 1 }); // Comparison

      const filters = { period: 'thisMonth', comparePeriod: 'previousPeriod' };
      const result = await dashboardService.getTotalSalesAmount(filters);

      expect(result).toEqual({ mainPeriodSales: 2000.00, comparisonPeriodSales: 1800.00 });
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return null for comparisonPeriodSales if comparePeriod is "Nenhum"', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ total_sales: '100.00' }], rowCount: 1 }); // Main period

      const filters = { period: 'thisMonth', comparePeriod: 'Nenhum' };
      const result = await dashboardService.getTotalSalesAmount(filters);
      expect(result.mainPeriodSales).toBe(100.00);
      expect(result.comparisonPeriodSales).toBeNull();
      expect(mockQuery).toHaveBeenCalledTimes(1); // Only main period query
    });

    it('should handle filters like salesperson and product', async () => {
      mockQuery.mockResolvedValue({ rows: [{ total_sales: '500.00' }], rowCount: 1 });

      const filters = {
        period: 'today',
        salesperson: 'user-123',
        product: 'prod-456',
        region: 'North',
      };
      await dashboardService.getTotalSalesAmount(filters);

      const sql = mockQuery.mock.calls[0][0];
      const params = mockQuery.mock.calls[0][1];
      expect(sql).toContain('s.sale_date = CURRENT_DATE');
      expect(sql).toContain('s.user_id = $');
      expect(sql).toContain('EXISTS (SELECT 1 FROM sale_items si');
      expect(sql).toContain('EXISTS (SELECT 1 FROM customers c');
      expect(params).toContain('user-123');
      expect(params).toContain('prod-456');
      expect(params).toContain('North');
    });

    it('should handle custom period', async () => {
        mockQuery.mockResolvedValue({ rows: [{ total_sales: '100.00' }], rowCount: 1 });
        const filters = {
            period: 'custom',
            startDate: '2023-01-01',
            endDate: '2023-01-31',
        };
        await dashboardService.getTotalSalesAmount(filters);
        const sql = mockQuery.mock.calls[0][0];
        const params = mockQuery.mock.calls[0][1];
        expect(sql).toContain('s.sale_date BETWEEN $');
        expect(params).toEqual(['2023-01-01', '2023-01-31']);
    });
  });

  describe('getSalesByMonth', () => {
    it('should return sales grouped by month', async () => {
      const mockData = [
        { month: '2023-01', monthly_sales: '1000' },
        { month: '2023-02', monthly_sales: '2000' },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockData, rowCount: 2 });

      const result = await dashboardService.getSalesByMonth({ period: 'thisYear' });

      expect(result.mainPeriodSalesByMonth).toEqual([
        { month: '2023-01', monthly_sales: 1000 },
        { month: '2023-02', monthly_sales: 2000 },
      ]);
      expect(result.comparisonPeriodSalesByMonth).toBeNull();
    });

    it('should return sales grouped by month with comparison', async () => {
        const mockDataMain = [{ month: '2023-01', monthly_sales: '1000' }];
        const mockDataComp = [{ month: '2022-01', monthly_sales: '900' }];
  
        mockQuery
            .mockResolvedValueOnce({ rows: mockDataMain, rowCount: 1 })
            .mockResolvedValueOnce({ rows: mockDataComp, rowCount: 1 });
  
        const result = await dashboardService.getSalesByMonth({ period: 'thisYear', comparePeriod: 'previousYear' });
  
        expect(result.mainPeriodSalesByMonth).toHaveLength(1);
        expect(result.comparisonPeriodSalesByMonth).toHaveLength(1);
        expect(result.comparisonPeriodSalesByMonth![0].monthly_sales).toBe(900);
      });

    it('should handle "Nenhum" for comparePeriod', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Main period
      const result = await dashboardService.getSalesByMonth({ period: 'thisMonth', comparePeriod: 'Nenhum' });
      expect(result.comparisonPeriodSalesByMonth).toBeNull();
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTopSellingProducts', () => {
    it('should return top selling products', async () => {
      const mockData = [
        { product_name: 'Prod A', variation_color: 'Red', total_quantity_sold: '50' },
        { product_name: 'Prod B', variation_color: 'Blue', total_quantity_sold: '30' },
      ];
      mockQuery.mockResolvedValue({ rows: mockData, rowCount: 2 });

      const result = await dashboardService.getTopSellingProducts({ period: 'thisMonth' });

      expect(result.mainPeriodTopSellingProducts).toHaveLength(2);
      expect(result.mainPeriodTopSellingProducts[0].total_quantity_sold).toBe(50);
      
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY total_quantity_sold DESC'),
        expect.any(Array)
      );
    });
    it('should return top selling products with comparison', async () => {
      const mockDataMain = [
        { product_name: 'Prod A', variation_color: 'Red', total_quantity_sold: '50' },
      ];
      const mockDataComp = [
        { product_name: 'Prod C', variation_color: 'Green', total_quantity_sold: '40' },
      ];
      mockQuery
        .mockResolvedValueOnce({ rows: mockDataMain, rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockDataComp, rowCount: 1 });

      const filters = { period: 'thisMonth', comparePeriod: 'previousPeriod' };
      const result = await dashboardService.getTopSellingProducts(filters);
      expect(result.mainPeriodTopSellingProducts).toHaveLength(1);
      expect(result.comparisonPeriodTopSellingProducts).toHaveLength(1);
    });
  });

  describe('getRecentSales', () => {
    it('should return recent sales', async () => {
      const mockData = [
        { id: 1, total_amount: '150.00', sale_date: '2023-10-27' },
      ];
      mockQuery.mockResolvedValue({ rows: mockData, rowCount: 1 });

      const result = await dashboardService.getRecentSales({ period: 'today' });

      expect(result.mainPeriodRecentSales).toHaveLength(1);
      expect(result.mainPeriodRecentSales[0].total_amount).toBe(150.00);
    });
    it('should return recent sales with comparison', async () => {
      const mockDataMain = [{ id: 1, total_amount: '150.00', sale_date: '2023-10-27' }];
      const mockDataComp = [{ id: 2, total_amount: '100.00', sale_date: '2022-10-27' }];
      mockQuery
        .mockResolvedValueOnce({ rows: mockDataMain, rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockDataComp, rowCount: 1 });

      const filters = { period: 'today', comparePeriod: 'previousYear' };
      const result = await dashboardService.getRecentSales(filters);
      expect(result.mainPeriodRecentSales).toHaveLength(1);
      expect(result.comparisonPeriodRecentSales).toHaveLength(1);
    });
  });

  describe('getSlowMovingProducts', () => {
    it('should return slow moving products', async () => {
      const mockData = [
        { name: 'Old Prod', color: 'Black', quantity: 5, last_sale_date: '2022-01-01', days_since_sale: '300' },
      ];
      mockQuery.mockResolvedValue({ rows: mockData, rowCount: 1 });

      const result = await dashboardService.getSlowMovingProducts({ period: 'last30days' });

      expect(result.mainPeriodSlowMovingProducts).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('HAVING MAX(s.sale_date) < NOW()'),
        expect.any(Array)
      );
    });
    it('should return slow moving products with comparison', async () => {
      const mockDataMain = [{ name: 'Old Prod', color: 'Black', quantity: 5 }];
      const mockDataComp = [{ name: 'Older Prod', color: 'White', quantity: 3 }];
      mockQuery
        .mockResolvedValueOnce({ rows: mockDataMain, rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockDataComp, rowCount: 1 });
      const filters = { period: 'last30days', comparePeriod: 'previousPeriod' };
      const result = await dashboardService.getSlowMovingProducts(filters);
      expect(result.mainPeriodSlowMovingProducts).toHaveLength(1);
      expect(result.comparisonPeriodSlowMovingProducts).toHaveLength(1);
    });
  });

  describe('getSalesForecast', () => {
    it('should return sales forecast', async () => {
      const mockData = [{ current_sales: '5000.00', projected_sales: '10000.00' }];
      mockQuery.mockResolvedValue({ rows: mockData, rowCount: 1 });

      const result = await dashboardService.getSalesForecast({ period: 'thisMonth' });

      expect(result.mainPeriodSalesForecast).toEqual({
        current_sales: 5000.00,
        projected_sales: 10000.00,
      });
    });
    it('should return sales forecast with comparison', async () => {
      const mockDataMain = [{ current_sales: '5000.00', projected_sales: '10000.00' }];
      const mockDataComp = [{ current_sales: '4000.00', projected_sales: '8000.00' }];
      mockQuery
        .mockResolvedValueOnce({ rows: mockDataMain, rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockDataComp, rowCount: 1 });
      const filters = { period: 'thisMonth', comparePeriod: 'previousPeriod' };
      const result = await dashboardService.getSalesForecast(filters);
      expect(result.mainPeriodSalesForecast.current_sales).toBe(5000.00);
      expect(result.comparisonPeriodSalesForecast!.current_sales).toBe(4000.00);
    });
  });

  describe('getAverageTicketBySalesperson', () => {
    it('should return average ticket by salesperson', async () => {
      const mockData = [{ user_name: 'John Doe', avg_ticket: '150.50', total_sales: '10' }];
      mockQuery.mockResolvedValue({ rows: mockData, rowCount: 1 });

      const result = await dashboardService.getAverageTicketBySalesperson({ period: 'thisMonth' });

      expect(result.mainPeriodAverageTicketBySalesperson).toHaveLength(1);
      expect(result.mainPeriodAverageTicketBySalesperson[0].avg_ticket).toBe(150.50);
    });
    it('should return average ticket by salesperson with comparison', async () => {
      const mockDataMain = [{ user_name: 'John Doe', avg_ticket: '150.50', total_sales: '10' }];
      const mockDataComp = [{ user_name: 'Jane Smith', avg_ticket: '120.00', total_sales: '8' }];
      mockQuery
        .mockResolvedValueOnce({ rows: mockDataMain, rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockDataComp, rowCount: 1 });
      const filters = { period: 'thisMonth', comparePeriod: 'previousPeriod' };
      const result = await dashboardService.getAverageTicketBySalesperson(filters);
      expect(result.mainPeriodAverageTicketBySalesperson).toHaveLength(1);
      expect(result.comparisonPeriodAverageTicketBySalesperson).toHaveLength(1);
    });
  });

  describe('getSalesHeatmapData', () => {
    it('should return sales heatmap data', async () => {
      const mockData = [{ city: 'Rio de Janeiro', state: 'RJ', sales_count: '20', total_revenue: '5000.00' }];
      mockQuery.mockResolvedValue({ rows: mockData, rowCount: 1 });

      const result = await dashboardService.getSalesHeatmapData({ period: 'thisYear' });

      expect(result.mainPeriodSalesHeatmapData).toHaveLength(1);
      expect(result.mainPeriodSalesHeatmapData[0].total_revenue).toBe(5000.00);
    });
    it('should return sales heatmap data with comparison', async () => {
      const mockDataMain = [{ city: 'Rio de Janeiro', state: 'RJ', sales_count: '20', total_revenue: '5000.00' }];
      const mockDataComp = [{ city: 'São Paulo', state: 'SP', sales_count: '15', total_revenue: '4000.00' }];
      mockQuery
        .mockResolvedValueOnce({ rows: mockDataMain, rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockDataComp, rowCount: 1 });
      const filters = { period: 'thisYear', comparePeriod: 'previousPeriod' };
      const result = await dashboardService.getSalesHeatmapData(filters);
      expect(result.mainPeriodSalesHeatmapData).toHaveLength(1);
      expect(result.comparisonPeriodSalesHeatmapData).toHaveLength(1);
    });
  });

  describe('Comparison Logic Coverage', () => {
      const testCases = [
          { period: 'today', compare: 'previousPeriod' },
          { period: 'today', compare: 'previousYear' },
          { period: 'last7days', compare: 'previousPeriod' },
          { period: 'last7days', compare: 'previousYear' },
          { period: 'last30days', compare: 'previousPeriod' },
          { period: 'last30days', compare: 'previousYear' },
          { period: 'thisMonth', compare: 'previousPeriod' },
          { period: 'thisMonth', compare: 'previousYear' },
          { period: 'lastMonth', compare: 'previousPeriod' },
          { period: 'lastMonth', compare: 'previousYear' },
          { period: 'thisYear', compare: 'previousPeriod' },
          { period: 'thisYear', compare: 'previousYear' },
          // Testes para custom period
          { period: 'custom', startDate: '2023-01-01', endDate: '2023-01-07', compare: 'previousPeriod' },
          { period: 'custom', startDate: '2023-01-01', endDate: '2023-01-07', compare: 'previousYear' },
      ];
      
      testCases.forEach(({ period, startDate, endDate, compare }) => {
          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getTotalSalesAmount)`, async () => {
              mockQuery
                .mockResolvedValueOnce({ rows: [{ total_sales: '0' }], rowCount: 1 }) // Main
                .mockResolvedValueOnce({ rows: [{ total_sales: '0' }], rowCount: 1 }); // Comparison
              const filters: any = { period, comparePeriod: compare };
              if (startDate) filters.startDate = startDate;
              if (endDate) filters.endDate = endDate;

              await dashboardService.getTotalSalesAmount(filters);
              expect(mockQuery).toHaveBeenCalledTimes(2); 
          });

          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getSalesByMonth)`, async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Main
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Comparison
            const filters: any = { period, comparePeriod: compare };
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            await dashboardService.getSalesByMonth(filters);
            expect(mockQuery).toHaveBeenCalledTimes(2);
          });

          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getTopSellingProducts)`, async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Main
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Comparison
            const filters: any = { period, comparePeriod: compare };
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            await dashboardService.getTopSellingProducts(filters);
            expect(mockQuery).toHaveBeenCalledTimes(2);
          });

          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getRecentSales)`, async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Main
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Comparison
            const filters: any = { period, comparePeriod: compare };
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            await dashboardService.getRecentSales(filters);
            expect(mockQuery).toHaveBeenCalledTimes(2);
          });
          
          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getSlowMovingProducts)`, async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Main
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Comparison
            const filters: any = { period, comparePeriod: compare };
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            await dashboardService.getSlowMovingProducts(filters);
            expect(mockQuery).toHaveBeenCalledTimes(2);
          });
          
          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getSalesForecast)`, async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [{ current_sales: '0', projected_sales: '0' }], rowCount: 1 }) // Main
                .mockResolvedValueOnce({ rows: [{ current_sales: '0', projected_sales: '0' }], rowCount: 1 }); // Comparison
            const filters: any = { period, comparePeriod: compare };
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            await dashboardService.getSalesForecast(filters);
            expect(mockQuery).toHaveBeenCalledTimes(2);
          });
          
          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getAverageTicketBySalesperson)`, async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Main
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Comparison
            const filters: any = { period, comparePeriod: compare };
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            await dashboardService.getAverageTicketBySalesperson(filters);
            expect(mockQuery).toHaveBeenCalledTimes(2);
          });
          
          it(`should calculate comparison correctly for period: ${period}, compare: ${compare} (getSalesHeatmapData)`, async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Main
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Comparison
            const filters: any = { period, comparePeriod: compare };
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            await dashboardService.getSalesHeatmapData(filters);
            expect(mockQuery).toHaveBeenCalledTimes(2);
          });
      });
  });
});