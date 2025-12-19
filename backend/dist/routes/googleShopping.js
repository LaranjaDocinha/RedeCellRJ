import { Router } from 'express';
import * as googleShoppingController from '../controllers/googleShoppingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.post('/sync-products', authMiddleware.authorize('manage', 'GoogleShoppingIntegration'), googleShoppingController.syncProducts);
router.get('/status', authMiddleware.authorize('view', 'GoogleShoppingIntegration'), googleShoppingController.getStatus);
export default router;
