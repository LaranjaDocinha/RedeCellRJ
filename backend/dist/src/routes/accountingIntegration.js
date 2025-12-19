import { Router } from 'express';
import * as accountingIntegrationController from '../controllers/accountingIntegrationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.post('/sync-sales', accountingIntegrationController.syncSales);
router.post('/sync-expenses', accountingIntegrationController.syncExpenses);
router.get('/status', accountingIntegrationController.getStatus);
export default router;
