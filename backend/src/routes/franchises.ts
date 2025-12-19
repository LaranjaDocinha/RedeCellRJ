import { Router } from 'express';
import * as franchiseController from '../controllers/franchiseController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  '/',
  authMiddleware.authorize('manage', 'Franchises'),
  franchiseController.createFranchise,
);
router.get('/', authMiddleware.authorize('view', 'Franchises'), franchiseController.getFranchises);
router.put(
  '/:id/status',
  authMiddleware.authorize('manage', 'Franchises'),
  franchiseController.updateFranchiseStatus,
);
router.delete(
  '/:id',
  authMiddleware.authorize('manage', 'Franchises'),
  franchiseController.deleteFranchise,
);
router.get(
  '/reports/consolidated',
  authMiddleware.authorize('view', 'Franchises'),
  franchiseController.getConsolidatedReports,
);
router.get(
  '/:id/settings',
  authMiddleware.authorize('view', 'Franchises'),
  franchiseController.getFranchiseSettings,
);

export default router;
