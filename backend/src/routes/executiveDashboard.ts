import { Router } from 'express';
import { executiveDashboardController } from '../controllers/executiveDashboardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Only admin/manager should access
router.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Dashboard'),
  executiveDashboardController.getStats,
);
router.get(
  '/download-premium',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Dashboard'),
  executiveDashboardController.downloadInfographic,
);

export default router;
