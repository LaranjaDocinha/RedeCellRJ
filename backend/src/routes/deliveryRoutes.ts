import { Router } from 'express';
import { deliveryController } from '../controllers/deliveryController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/quotes',
  authMiddleware.authenticate,
  authMiddleware.authorize('manage', 'Order'),
  deliveryController.getQuotes,
);
router.post(
  '/request',
  authMiddleware.authenticate,
  authMiddleware.authorize('manage', 'Order'),
  deliveryController.createDelivery,
);

export default router;
