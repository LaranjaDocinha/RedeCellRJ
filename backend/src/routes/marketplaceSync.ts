import { Router } from 'express';
import * as marketplaceSyncController from '../controllers/marketplaceSyncController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  '/sync-products',
  authMiddleware.authorize('manage', 'MarketplaceSync'),
  marketplaceSyncController.syncProducts,
);
router.post(
  '/sync-orders',
  authMiddleware.authorize('manage', 'MarketplaceSync'),
  marketplaceSyncController.syncOrders,
);
router.get(
  '/status',
  authMiddleware.authorize('view', 'MarketplaceSync'),
  marketplaceSyncController.getStatus,
);

export default router;
