import { Router } from 'express';
import { customer360Controller } from '../controllers/customer360Controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/:id/timeline',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Customer'),
  customer360Controller.getTimeline,
);

export default router;
