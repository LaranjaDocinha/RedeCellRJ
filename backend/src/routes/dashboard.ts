import { Router, Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js'; // Added import

const dashboardRouter = Router();

dashboardRouter.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Dashboard'),
  cacheMiddleware(), // Applied cache middleware
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period, startDate, endDate, salesperson, product, region, comparePeriod } = req.query; // Adicionado comparePeriod

      const filters = {
        period: period as string,
        startDate: startDate as string,
        endDate: endDate as string,
        salesperson: salesperson as string,
        product: product as string,
        region: region as string,
        comparePeriod: comparePeriod as string, // Adicionado comparePeriod
      };

      // Passa os filtros para cada método do serviço
      const totalSales = await dashboardService.getTotalSalesAmount(filters);
      const salesByMonth = await dashboardService.getSalesByMonth(filters);
      const topSellingProducts = await dashboardService.getTopSellingProducts(filters);
      const recentSales = await dashboardService.getRecentSales(filters);
      const slowMovingProducts = await dashboardService.getSlowMovingProducts(filters);
      const salesForecast = await dashboardService.getSalesForecast(filters);
      const averageTicketBySalesperson = await dashboardService.getAverageTicketBySalesperson(filters);
      const salesHeatmap = await dashboardService.getSalesHeatmapData(filters);

      res.status(200).json({
        totalSales,
        salesByMonth,
        topSellingProducts,
        recentSales,
        slowMovingProducts,
        salesForecast,
        averageTicketBySalesperson,
        salesHeatmap,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default dashboardRouter;
