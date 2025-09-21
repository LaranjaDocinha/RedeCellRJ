var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const dashboardRouter = Router();
dashboardRouter.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Dashboard'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalSales = yield dashboardService.getTotalSalesAmount();
        const salesByMonth = yield dashboardService.getSalesByMonth();
        const topSellingProducts = yield dashboardService.getTopSellingProducts();
        res.status(200).json({
            totalSales,
            salesByMonth,
            topSellingProducts,
        });
    }
    catch (error) {
        next(error);
    }
}));
export default dashboardRouter;
