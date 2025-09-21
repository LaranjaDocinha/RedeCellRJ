import { Router, Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const dashboardRouter = Router();

dashboardRouter.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Dashboard'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalSales = await dashboardService.getTotalSalesAmount();
      const salesByMonth = await dashboardService.getSalesByMonth();
      const topSellingProducts = await dashboardService.getTopSellingProducts();

      res.status(200).json({
        totalSales,
        salesByMonth,
        topSellingProducts,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default dashboardRouter;
