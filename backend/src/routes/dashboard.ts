import { Router, Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';

const dashboardRouter = Router();

dashboardRouter.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Dashboard'),
  cacheMiddleware(60), // Cache de 1 minuto para performance
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period, salesperson, product, region } = req.query;

      const filters = {
        period: period as string,
        salesperson: salesperson as string,
        product: product as string,
        region: region as string,
        comparePeriod: 'previousPeriod',
      };

      // PERFORMANCE: Executa todas as buscas em paralelo no banco de dados
      const [
        totalSales,
        salesByMonth,
        topSellingProducts,
        recentSales,
        slowMovingProducts,
        salesForecast,
        averageTicketBySalesperson,
        salesHeatmap,
        stockABC,
        hourlySales,
      ] = await Promise.all([
        dashboardService.getTotalSalesAmount(filters),
        dashboardService.getSalesByMonth(filters),
        dashboardService.getTopSellingProducts(filters),
        dashboardService.getRecentSales(filters),
        dashboardService.getSlowMovingProducts(filters),
        dashboardService.getSalesForecast(filters),
        dashboardService.getAverageTicketBySalesperson(filters),
        dashboardService.getSalesHeatmapData(filters),
        dashboardService.getStockABC(),
        dashboardService.getHourlySalesData(filters),
      ]);

      res.status(200).json({
        totalSales,
        salesByMonth,
        topSellingProducts,
        recentSales,
        slowMovingProducts,
        salesForecast,
        averageTicketBySalesperson,
        salesHeatmap,
        stockABC,
        hourlySales,
      });
    } catch (error) {
      console.error('[Dashboard Error]:', error);
      next(error);
    }
  },
);

export default dashboardRouter;
