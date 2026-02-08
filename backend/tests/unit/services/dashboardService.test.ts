import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from '../../../src/services/dashboardService.js';
import { dashboardRepository } from '../../../src/repositories/dashboard.repository.js';
import redisClient from '../../../src/utils/redisClient.js';

vi.mock('../../../src/repositories/dashboard.repository.js', () => ({
  dashboardRepository: {
    getTotalSales: vi.fn(),
    getSalesByMonth: vi.fn(),
    getTopSellingProducts: vi.fn(),
    getRecentSales: vi.fn(),
    getSlowMovingProducts: vi.fn(),
    getSalesForecast: vi.fn(),
    getAverageTicket: vi.fn(),
    getStockABC: vi.fn(),
    getHourlySales: vi.fn(),
  },
}));

vi.mock('../../../src/utils/redisClient.js', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    setEx: vi.fn().mockResolvedValue('OK'),
  },
}));

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Caching Logic', () => {
    it('should return cached data if available', async () => {
      const cachedData = { mainPeriodSales: { total: 100 }, comparisonPeriodSales: null };
      vi.mocked(redisClient.get).mockResolvedValueOnce(JSON.stringify(cachedData));

      const res = await dashboardService.getTotalSalesAmount({});

      expect(res).toEqual(cachedData);
      expect(dashboardRepository.getTotalSales).not.toHaveBeenCalled();
    });

    it('should set cache if not available', async () => {
      vi.mocked(dashboardRepository.getTotalSales).mockResolvedValue({ total: 100 });
      await dashboardService.getTotalSalesAmount({});
      expect(redisClient.setEx).toHaveBeenCalled();
    });
  });

  describe('calculateComparisonPeriod branches', () => {
    it('should handle period: custom with comparePeriod: previousPeriod', async () => {
      await dashboardService.getTotalSalesAmount({
        period: 'custom',
        startDate: '2023-01-10',
        endDate: '2023-01-20',
        comparePeriod: 'previousPeriod'
      });
      // diff is 10 days. Previous period should be 2022-12-30 to 2023-01-09
      expect(dashboardRepository.getTotalSales).toHaveBeenCalledTimes(2);
    });

    it('should handle period: today with previousYear', async () => {
      await dashboardService.getTotalSalesAmount({ period: 'today', comparePeriod: 'previousYear' });
      expect(dashboardRepository.getTotalSales).toHaveBeenCalledTimes(2);
    });

    it('should handle period: last7days with previousPeriod', async () => {
      await dashboardService.getTotalSalesAmount({ period: 'last7days', comparePeriod: 'previousPeriod' });
      expect(dashboardRepository.getTotalSales).toHaveBeenCalledTimes(2);
    });

    it('should handle period: last30days with previousYear', async () => {
      await dashboardService.getTotalSalesAmount({ period: 'last30days', comparePeriod: 'previousYear' });
      expect(dashboardRepository.getTotalSales).toHaveBeenCalledTimes(2);
    });

    it('should handle period: thisMonth with previousPeriod', async () => {
      await dashboardService.getTotalSalesAmount({ period: 'thisMonth', comparePeriod: 'previousPeriod' });
      expect(dashboardRepository.getTotalSales).toHaveBeenCalledTimes(2);
    });

    it('should handle period: lastMonth with previousYear', async () => {
      await dashboardService.getTotalSalesAmount({ period: 'lastMonth', comparePeriod: 'previousYear' });
      expect(dashboardRepository.getTotalSales).toHaveBeenCalledTimes(2);
    });

    it('should handle period: thisYear with previousPeriod', async () => {
      await dashboardService.getTotalSalesAmount({ period: 'thisYear', comparePeriod: 'previousPeriod' });
      expect(dashboardRepository.getTotalSales).toHaveBeenCalledTimes(2);
    });
  });

  describe('Other Dashboard Methods', () => {
    it('getSalesByMonth', async () => {
      await dashboardService.getSalesByMonth({ period: 'thisYear' });
      expect(dashboardRepository.getSalesByMonth).toHaveBeenCalled();
    });

    it('getTopSellingProducts', async () => {
      await dashboardService.getTopSellingProducts({ period: 'last30days' });
      expect(dashboardRepository.getTopSellingProducts).toHaveBeenCalled();
    });

    it('getRecentSales', async () => {
      await dashboardService.getRecentSales({ period: 'today', comparePeriod: 'previousPeriod' });
      expect(dashboardRepository.getRecentSales).toHaveBeenCalledTimes(2);
    });

    it('getSlowMovingProducts', async () => {
      await dashboardService.getSlowMovingProducts({ period: 'last30days', comparePeriod: 'previousPeriod' });
      expect(dashboardRepository.getSlowMovingProducts).toHaveBeenCalledTimes(2);
    });

    it('getSalesForecast', async () => {
      await dashboardService.getSalesForecast({ period: 'thisMonth', comparePeriod: 'previousPeriod' });
      expect(dashboardRepository.getSalesForecast).toHaveBeenCalledTimes(2);
    });

    it('getAverageTicketBySalesperson', async () => {
      await dashboardService.getAverageTicketBySalesperson({ period: 'last7days', comparePeriod: 'previousPeriod' });
      expect(dashboardRepository.getAverageTicket).toHaveBeenCalledTimes(2);
    });

    it('getSalesHeatmapData', async () => {
      const res = await dashboardService.getSalesHeatmapData({});
      expect(res.mainPeriodSalesHeatmapData).toHaveLength(4);
    });

    it('getStockABC', async () => {
      await dashboardService.getStockABC();
      expect(dashboardRepository.getStockABC).toHaveBeenCalled();
    });

    it('getHourlySalesData', async () => {
      await dashboardService.getHourlySalesData({});
      expect(dashboardRepository.getHourlySales).toHaveBeenCalled();
    });
  });
});
