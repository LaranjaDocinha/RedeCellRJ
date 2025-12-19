import { Router } from 'express';
import * as wordpressController from '../controllers/wordpressController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  '/sync-products',
  authMiddleware.authorize('manage', 'WordPressIntegration'),
  wordpressController.syncProducts,
);
router.post(
  '/sync-orders',
  authMiddleware.authorize('manage', 'WordPressIntegration'),
  wordpressController.syncOrders,
);
router.get(
  '/status',
  authMiddleware.authorize('view', 'WordPressIntegration'),
  wordpressController.getStatus,
);

export default router;
