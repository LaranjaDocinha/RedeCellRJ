import { Router } from 'express';
import * as paymentMethodController from '../controllers/paymentMethodController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  '/:customerId',
  authMiddleware.authorize('manage', 'CustomerPaymentMethods'),
  paymentMethodController.createPaymentMethod,
);
router.get(
  '/:customerId',
  authMiddleware.authorize('view', 'CustomerPaymentMethods'),
  paymentMethodController.getPaymentMethodsByCustomerId,
);
router.put(
  '/:id',
  authMiddleware.authorize('manage', 'CustomerPaymentMethods'),
  paymentMethodController.updatePaymentMethod,
);
router.delete(
  '/:id',
  authMiddleware.authorize('manage', 'CustomerPaymentMethods'),
  paymentMethodController.deletePaymentMethod,
);

export default router;
