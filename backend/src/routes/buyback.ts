import { Router } from 'express';
import * as buybackController from '../controllers/buybackController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.get(
  '/value',
  authMiddleware.authorize('view', 'BuybackProgram'),
  buybackController.calculateBuybackValue,
);
router.post(
  '/initiate',
  authMiddleware.authorize('manage', 'BuybackProgram'),
  buybackController.initiateBuyback,
);

export default router;
