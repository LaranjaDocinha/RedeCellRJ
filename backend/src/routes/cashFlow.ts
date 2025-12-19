import { Router } from 'express';
import * as cashFlowController from '../controllers/cashFlowController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.get('/', cashFlowController.getCashFlow);

export default router;
