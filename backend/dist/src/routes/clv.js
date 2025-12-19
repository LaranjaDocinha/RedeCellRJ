import { Router } from 'express';
import { getClvReport } from '../controllers/clvController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.get('/customers/:customerId/clv', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), getClvReport);
export default router;
