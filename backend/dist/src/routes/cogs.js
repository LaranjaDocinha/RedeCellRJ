import { Router } from 'express';
import { getCogsReport } from '../controllers/cogsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), getCogsReport);
export default router;
