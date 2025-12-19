import { Router } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const dashboardRouter = Router();
dashboardRouter.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Dashboard'), async (req, res, next) => {
    try {
        const totalSales = await dashboardService.getTotalSalesAmount();
        const salesByMonth = await dashboardService.getSalesByMonth();
        const topSellingProducts = await dashboardService.getTopSellingProducts();
        const recentSales = await dashboardService.getRecentSales();
        res.status(200).json({
            totalSales,
            salesByMonth,
            topSellingProducts,
            recentSales,
        });
    }
    catch (error) {
        next(error);
    }
});
export default dashboardRouter;
