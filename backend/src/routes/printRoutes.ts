import { Router } from 'express';
import { printController } from '../controllers/printController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/calculate', authMiddleware.authenticate, printController.calculate);
router.post(
  '/jobs',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Order'),
  printController.createJob,
);
router.get(
  '/jobs',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Order'),
  printController.listJobs,
);
router.patch(
  '/jobs/:id/status',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'Order'),
  printController.updateStatus,
);
router.post(
  '/jobs/:id/notify',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'Order'),
  printController.notifyCustomer,
);

export default router;
