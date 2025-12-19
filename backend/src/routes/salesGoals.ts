import { Router } from 'express';
import * as salesGoalController from '../controllers/salesGoalController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

// Rota para obter a meta de vendas diária atual
router.get(
  '/current-daily',
  authMiddleware.authorize('read', 'SalesGoal'),
  salesGoalController.getCurrentDailySalesGoal,
);

export default router;