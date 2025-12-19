import { Router } from 'express';
import { getPnlReport } from '../controllers/pnlReportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), getPnlReport);
export default router;
