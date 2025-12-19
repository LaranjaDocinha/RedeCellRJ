import { Router } from 'express';
import * as ecommerceSyncController from '../controllers/ecommerceSyncController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.post('/sync-products', authMiddleware.authorize('manage', 'EcommerceSync'), ecommerceSyncController.syncProducts);
router.post('/sync-orders', authMiddleware.authorize('manage', 'EcommerceSync'), ecommerceSyncController.syncOrders);
router.get('/status', authMiddleware.authorize('view', 'EcommerceSync'), ecommerceSyncController.getStatus);
export default router;
