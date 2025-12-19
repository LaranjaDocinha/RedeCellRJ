import { Router } from 'express';
import * as userPerformanceController from '../controllers/userPerformanceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.get('/me', userPerformanceController.getMyPerformance);
export default router;
