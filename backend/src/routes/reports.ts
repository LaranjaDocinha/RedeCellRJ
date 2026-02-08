import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getPool } from '../db/index.js';
import * as financeService from '../services/financeService.js';
import * as reportDataService from '../services/reportDataService.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import { salesGoalService } from '../services/salesGoalService.js';
import { sendSuccess } from '../utils/responseHelper.js';

// Import controllers
import { generateZReport } from '../controllers/zReportController.js';
import { getPnlReport } from '../controllers/pnlReportController.js';
import { getCogsReport } from '../controllers/cogsController.js';
import { getClvReport } from '../controllers/clvController.js';
import { getFinancialDashboardData } from '../controllers/financialDashboardController.js';

const reportsRouter = Router();

reportsRouter.use(authMiddleware.authenticate);

// Z-Report
reportsRouter.get('/z-report', authMiddleware.authorize('read', 'ZReport'), generateZReport);

// P&L Report (Microservice proxy)
reportsRouter.get('/pnl', authMiddleware.authorize('read', 'Report'), getPnlReport);

// COGS Report
reportsRouter.get('/cogs', authMiddleware.authorize('read', 'Report'), getCogsReport);

// CLV Report
reportsRouter.get(
  '/clv/customers/:customerId',
  authMiddleware.authorize('read', 'Report'),
  getClvReport,
);

// Financial Dashboard
reportsRouter.get(
  '/financial-dashboard',
  authMiddleware.authorize('read', 'Report'),
  getFinancialDashboardData,
);

reportsRouter.get(
  '/contribution-margin-by-category',
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportDataService.getContributionMarginByCategory();
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  },
);

reportsRouter.get(
  '/sales-daily',
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const pool = getPool();
      const { rows } = await pool.query('SELECT * FROM sales_daily_summary LIMIT 30');
      sendSuccess(res, rows);
    } catch (error) {
      next(error);
    }
  },
);

reportsRouter.post(
  '/refresh-sales-summary',
  authMiddleware.authorize('manage', 'Report'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pool = getPool();
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY sales_daily_summary');
      sendSuccess(res, { message: 'Sales summary refreshed successfully' });
    } catch (error) {
      next(error);
    }
  },
);

reportsRouter.get(
  '/profitability',
  authMiddleware.authorize('read', 'Report'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' });
      }
      const report = await financeService.getProductProfitabilityReport(startDate, endDate);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  },
);

reportsRouter.get(
  '/sales-goals-progress',
  authMiddleware.authorize('read', 'Report'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, branchId } = req.query;
      if (!userId && !branchId) {
        return res.status(400).json({ message: 'Either userId or branchId is required.' });
      }
      const progress = await salesGoalService.getSalesGoalProgress({
        userId: userId ? String(userId) : undefined,
        branchId: branchId ? parseInt(String(branchId), 10) : undefined,
      });
      sendSuccess(res, progress);
    } catch (error) {
      next(error);
    }
  },
);

reportsRouter.get(
  '/break-even',
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportDataService.getBreakEvenPoint();
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  },
);

reportsRouter.get(
  '/customer-ltv',
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportDataService.getCustomerLTV();
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  },
);

reportsRouter.get(
  '/customer-acquisition-cost',
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportDataService.getCustomerAcquisitionCost();
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  },
);

export default reportsRouter;
