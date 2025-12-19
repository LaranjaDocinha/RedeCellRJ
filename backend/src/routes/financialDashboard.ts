import { Router } from 'express';
import { getFinancialDashboardData } from '../controllers/financialDashboardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/financial-dashboard',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Report'),
  getFinancialDashboardData,
);

export default router;
