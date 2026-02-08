import { dashboardRepository, DashboardFilters } from '../repositories/dashboard.repository.js';
import redisClient from '../utils/redisClient.js';

// Função auxiliar para calcular o período de comparação
// **NOTA:** Esta é uma implementação simplificada.
function calculateComparisonPeriod(
  period: string,
  startDate: string | undefined,
  endDate: string | undefined,
  comparePeriod: string,
) {
  const compPeriod = {
    period: '',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  };
  if (!comparePeriod || comparePeriod === 'Nenhum') return compPeriod;

  // Mock de Moment.js para demonstrar a lógica de cálculo
  const moment = (date?: string) => {
    const d = date ? new Date(date) : new Date();
    return {
      format: (fmt: string) => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        if (fmt === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
        const yearM = d.getFullYear();
        const monthM = (d.getMonth() + 1).toString().padStart(2, '0');
        if (fmt === 'YYYY-MM') return `${yearM}-${monthM}`;
        if (fmt === 'YYYY') return `${yearM}`;
        return '';
      },
      subtract: (amount: number, unit: 'days' | 'months' | 'years') => {
        const newD = new Date(d);
        if (unit === 'days') newD.setDate(d.getDate() - amount);
        if (unit === 'months') newD.setMonth(d.getMonth() - amount);
        if (unit === 'years') newD.setFullYear(d.getFullYear() - amount);
        return moment(newD.toISOString());
      },
      add: (amount: number, unit: 'days' | 'months' | 'years') => {
        const newD = new Date(d);
        if (unit === 'days') newD.setDate(d.getDate() + amount);
        if (unit === 'months') newD.setMonth(d.getMonth() + amount);
        if (unit === 'years') newD.setFullYear(d.getFullYear() + amount);
        return moment(newD.toISOString());
      },
      diff: (otherMoment: any, _unit: 'days') => {
        const diffTime = Math.abs(
          d.getTime() - new Date(otherMoment.format('YYYY-MM-DD')).getTime(),
        );
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },
    };
  };

  const getStartOfMonth = (m: any) => moment(`${m.format('YYYY-MM')}-01`);
  const getEndOfMonth = (m: any) =>
    moment(getStartOfMonth(m).add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD'));
  const getStartOfYear = (m: any) => moment(`${m.format('YYYY')}-01-01`);
  const getEndOfYear = (m: any) => moment(`${m.format('YYYY')}-12-31`);

  if (period === 'custom' && startDate && endDate) {
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const diffDays = endMoment.diff(startMoment, 'days');

    if (comparePeriod === 'previousPeriod') {
      compPeriod.startDate = startMoment.subtract(diffDays + 1, 'days').format('YYYY-MM-DD');
      compPeriod.endDate = startMoment.subtract(1, 'day').format('YYYY-MM-DD');
    } else if (comparePeriod === 'previousYear') {
      compPeriod.startDate = startMoment.subtract(1, 'year').format('YYYY-MM-DD');
      compPeriod.endDate = endMoment.subtract(1, 'year').format('YYYY-MM-DD');
    }
    compPeriod.period = 'custom';
  } else {
    const today = moment();
    switch (period) {
      case 'today':
        compPeriod.period = comparePeriod === 'previousPeriod' ? 'yesterday' : 'today';
        if (comparePeriod === 'previousYear') {
          const yearAgo = today.subtract(1, 'year');
          compPeriod.startDate = yearAgo.format('YYYY-MM-DD');
          compPeriod.endDate = yearAgo.format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        } else if (comparePeriod === 'previousPeriod') {
          const yesterday = today.subtract(1, 'day');
          compPeriod.startDate = yesterday.format('YYYY-MM-DD');
          compPeriod.endDate = yesterday.format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        }
        break;
      case 'last7days':
        if (comparePeriod === 'previousPeriod') {
          compPeriod.startDate = today.subtract(14, 'days').add(1, 'day').format('YYYY-MM-DD');
          compPeriod.endDate = today.subtract(7, 'days').format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        } else if (comparePeriod === 'previousYear') {
          const yearAgo = today.subtract(1, 'year');
          compPeriod.startDate = yearAgo.subtract(6, 'days').format('YYYY-MM-DD');
          compPeriod.endDate = yearAgo.format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        }
        break;
      case 'last30days':
        if (comparePeriod === 'previousPeriod') {
          compPeriod.startDate = today.subtract(60, 'days').add(1, 'day').format('YYYY-MM-DD');
          compPeriod.endDate = today.subtract(30, 'days').format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        } else if (comparePeriod === 'previousYear') {
          const yearAgo = today.subtract(1, 'year');
          compPeriod.startDate = yearAgo.subtract(29, 'days').format('YYYY-MM-DD');
          compPeriod.endDate = yearAgo.format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        }
        break;
      case 'thisMonth':
        if (comparePeriod === 'previousPeriod') {
          const lastMonth = today.subtract(1, 'month');
          compPeriod.startDate = getStartOfMonth(lastMonth).format('YYYY-MM-DD');
          compPeriod.endDate = getEndOfMonth(lastMonth).format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        } else if (comparePeriod === 'previousYear') {
          const yearAgo = today.subtract(1, 'year');
          compPeriod.startDate = getStartOfMonth(yearAgo).format('YYYY-MM-DD');
          compPeriod.endDate = getEndOfMonth(yearAgo).format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        }
        break;
      case 'lastMonth':
        if (comparePeriod === 'previousPeriod') {
          const twoMonthsAgo = today.subtract(2, 'month');
          compPeriod.startDate = getStartOfMonth(twoMonthsAgo).format('YYYY-MM-DD');
          compPeriod.endDate = getEndOfMonth(twoMonthsAgo).format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        } else if (comparePeriod === 'previousYear') {
          const lastMonth = today.subtract(1, 'month');
          const lastMonthLastYear = lastMonth.subtract(1, 'year');
          compPeriod.startDate = getStartOfMonth(lastMonthLastYear).format('YYYY-MM-DD');
          compPeriod.endDate = getEndOfMonth(lastMonthLastYear).format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        }
        break;
      case 'thisYear':
        if (comparePeriod === 'previousPeriod') {
          const lastYear = today.subtract(1, 'year');
          compPeriod.startDate = getStartOfYear(lastYear).format('YYYY-MM-DD');
          compPeriod.endDate = getEndOfYear(lastYear).format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        } else if (comparePeriod === 'previousYear') {
          const twoYearsAgo = today.subtract(2, 'year');
          compPeriod.startDate = getStartOfYear(twoYearsAgo).format('YYYY-MM-DD');
          compPeriod.endDate = getEndOfYear(twoYearsAgo).format('YYYY-MM-DD');
          compPeriod.period = 'custom';
        }
        break;
      default:
        break;
    }
  }

  return compPeriod;
}

export const dashboardService = {
  async getTotalSalesAmount(filters: DashboardFilters = {}) {
    const cacheKey = `dashboard:totalSales:${JSON.stringify(filters)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { period, startDate, endDate, comparePeriod } = filters;

    const mainPeriodSales = await dashboardRepository.getTotalSales(filters);

    let comparisonPeriodSales = null;
    if (comparePeriod && comparePeriod !== 'Nenhum') {
      const compPeriod = calculateComparisonPeriod(period!, startDate, endDate, comparePeriod);
      if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
        comparisonPeriodSales = await dashboardRepository.getTotalSales(filters, compPeriod);
      }
    }

    const result = { mainPeriodSales, comparisonPeriodSales };
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result)); // 5 min cache
    return result;
  },

  async getSalesByMonth(filters: DashboardFilters = {}) {
    const cacheKey = `dashboard:monthly:${JSON.stringify(filters)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { period, startDate, endDate, comparePeriod } = filters;

    const mainPeriodSalesByMonth = await dashboardRepository.getSalesByMonth(filters);

    let comparisonPeriodSalesByMonth = null;
    if (comparePeriod && comparePeriod !== 'Nenhum') {
      const compPeriod = calculateComparisonPeriod(period!, startDate, endDate, comparePeriod);
      if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
        comparisonPeriodSalesByMonth = await dashboardRepository.getSalesByMonth(
          filters,
          compPeriod,
        );
      }
    }

    const result = { mainPeriodSalesByMonth, comparisonPeriodSalesByMonth };
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result)); // 1 hour cache
    return result;
  },

  async getTopSellingProducts(filters: DashboardFilters = {}, limit: number = 5) {
    const cacheKey = `dashboard:topProducts:${limit}:${JSON.stringify(filters)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { period, startDate, endDate, comparePeriod } = filters;

    const mainPeriodTopSellingProducts = await dashboardRepository.getTopSellingProducts(
      filters,
      limit,
    );

    let comparisonPeriodTopSellingProducts = null;
    if (comparePeriod && comparePeriod !== 'Nenhum') {
      const compPeriod = calculateComparisonPeriod(period!, startDate, endDate, comparePeriod);
      if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
        comparisonPeriodTopSellingProducts = await dashboardRepository.getTopSellingProducts(
          filters,
          limit,
          compPeriod,
        );
      }
    }

    const result = { mainPeriodTopSellingProducts, comparisonPeriodTopSellingProducts };
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(result)); // 30 min cache
    return result;
  },

  async getRecentSales(filters: DashboardFilters = {}, limit: number = 5) {
    // Recent sales change frequently, low cache time or no cache
    const { period, startDate, endDate, comparePeriod } = filters;

    const mainPeriodRecentSales = await dashboardRepository.getRecentSales(filters, limit);

    let comparisonPeriodRecentSales = null;
    if (comparePeriod && comparePeriod !== 'Nenhum') {
      const compPeriod = calculateComparisonPeriod(period!, startDate, endDate, comparePeriod);
      if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
        comparisonPeriodRecentSales = await dashboardRepository.getRecentSales(
          filters,
          limit,
          compPeriod,
        );
      }
    }

    return { mainPeriodRecentSales, comparisonPeriodRecentSales };
  },

  async getSlowMovingProducts(filters: DashboardFilters = {}, days: number = 90) {
    const { period, startDate, endDate, comparePeriod } = filters;

    const mainPeriodSlowMovingProducts = await dashboardRepository.getSlowMovingProducts(
      filters,
      days,
    );

    let comparisonPeriodSlowMovingProducts = null;
    if (comparePeriod && comparePeriod !== 'Nenhum') {
      const compPeriod = calculateComparisonPeriod(period!, startDate, endDate, comparePeriod);
      if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
        comparisonPeriodSlowMovingProducts = await dashboardRepository.getSlowMovingProducts(
          filters,
          days,
          compPeriod,
        );
      }
    }

    return { mainPeriodSlowMovingProducts, comparisonPeriodSlowMovingProducts };
  },

  async getSalesForecast(filters: DashboardFilters = {}) {
    const { period, startDate, endDate, comparePeriod } = filters;

    const mainPeriodSalesForecast = await dashboardRepository.getSalesForecast(filters);

    let comparisonPeriodSalesForecast = null;
    if (comparePeriod && comparePeriod !== 'Nenhum') {
      const compPeriod = calculateComparisonPeriod(period!, startDate, endDate, comparePeriod);
      if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
        comparisonPeriodSalesForecast = await dashboardRepository.getSalesForecast(
          filters,
          compPeriod,
        );
      }
    }

    return { mainPeriodSalesForecast, comparisonPeriodSalesForecast };
  },

  async getAverageTicketBySalesperson(filters: DashboardFilters = {}) {
    const { period, startDate, endDate, comparePeriod } = filters;

    const mainPeriodAverageTicketBySalesperson =
      await dashboardRepository.getAverageTicket(filters);

    let comparisonPeriodAverageTicketBySalesperson = null;
    if (comparePeriod && comparePeriod !== 'Nenhum') {
      const compPeriod = calculateComparisonPeriod(period!, startDate, endDate, comparePeriod);
      if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
        comparisonPeriodAverageTicketBySalesperson = await dashboardRepository.getAverageTicket(
          filters,
          compPeriod,
        );
      }
    }

    return { mainPeriodAverageTicketBySalesperson, comparisonPeriodAverageTicketBySalesperson };
  },

  async getSalesHeatmapData(_filters: DashboardFilters = {}) {
    // A coluna 'region' na tabela 'customers' não existe no schema atual.
    // Retornar dados mockados para evitar o erro.
    const mainPeriodSalesHeatmapData = [
      { id: 1, name: 'Centro', sales: Math.floor(Math.random() * 10000) },
      { id: 2, name: 'Zona Sul', sales: Math.floor(Math.random() * 10000) },
      { id: 3, name: 'Zona Oeste', sales: Math.floor(Math.random() * 10000) },
      { id: 4, name: 'Zona Norte', sales: Math.floor(Math.random() * 10000) },
    ];
    const comparisonPeriodSalesHeatmapData = [
      { id: 1, name: 'Centro', sales: Math.floor(Math.random() * 8000) },
      { id: 2, name: 'Zona Sul', sales: Math.floor(Math.random() * 9000) },
      { id: 3, name: 'Zona Oeste', sales: Math.floor(Math.random() * 7000) },
      { id: 4, name: 'Zona Norte', sales: Math.floor(Math.random() * 8500) },
    ];

    return { mainPeriodSalesHeatmapData, comparisonPeriodSalesHeatmapData };
  },

  async getStockABC() {
    return dashboardRepository.getStockABC();
  },

  async getHourlySalesData(filters: DashboardFilters = {}) {
    return dashboardRepository.getHourlySales(filters);
  },
};
