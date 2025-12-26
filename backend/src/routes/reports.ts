import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getPool } from '../db/index.js';
import * as financeService from '../services/financeService.js';
import * as reportDataService from '../services/reportDataService.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import { salesGoalService } from '../services/salesGoalService.js';

const reportsRouter = Router();

reportsRouter.get(
  '/contribution-margin-by-category',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportService.getContributionMarginByCategory();
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

reportsRouter.get(
  '/sales-daily',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const pool = getPool();
      const { rows } = await pool.query('SELECT * FROM sales_daily_summary LIMIT 30');
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }
);

reportsRouter.post(
  '/refresh-sales-summary',
  authMiddleware.authenticate,
  authMiddleware.authorize('manage', 'Report'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pool = getPool();
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY sales_daily_summary');
      res.json({ message: 'Sales summary refreshed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

reportsRouter.get(
  '/profitability',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Report'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' });
      }
      const report = await financeService.getProductProfitabilityReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

reportsRouter.get(
  '/sales-goals-progress',
  authMiddleware.authenticate,
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
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }
);

reportsRouter.get(
  '/break-even',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportDataService.getBreakEvenPoint();
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

reportsRouter.get(
  '/customer-ltv',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportDataService.getCustomerLTV();
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

reportsRouter.get(
  '/customer-acquisition-cost',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Report'),
  cacheMiddleware(),
  async (req, res, next) => {
    try {
      const report = await reportDataService.getCustomerAcquisitionCost();
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

export default reportsRouter;