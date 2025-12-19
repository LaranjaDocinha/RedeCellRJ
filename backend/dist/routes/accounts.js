import { Router } from 'express';
import * as accountsController from '../controllers/accountsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
// Accounts Payable
router.post('/payable', authMiddleware.authorize('manage', 'AccountsPayable'), accountsController.createPayable);
router.get('/payable', authMiddleware.authorize('view', 'AccountsPayable'), accountsController.getPayables);
router.put('/payable/:id/status', authMiddleware.authorize('manage', 'AccountsPayable'), accountsController.updatePayableStatus);
// Accounts Receivable
router.post('/receivable', authMiddleware.authorize('manage', 'AccountsReceivable'), accountsController.createReceivable);
router.get('/receivable', authMiddleware.authorize('view', 'AccountsReceivable'), accountsController.getReceivables);
router.put('/receivable/:id/status', authMiddleware.authorize('manage', 'AccountsReceivable'), accountsController.updateReceivableStatus);
export default router;
