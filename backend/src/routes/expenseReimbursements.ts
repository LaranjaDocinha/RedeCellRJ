import { Router } from 'express';
import * as expenseReimbursementController from '../controllers/expenseReimbursementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

// Employees can create and view their own requests
router.post('/', expenseReimbursementController.createRequest);
router.get('/me', expenseReimbursementController.getUserRequests);

// Managers can view all requests and approve/reject them
router.get(
  '/',
  authMiddleware.authorize('manage', 'Reimbursements'),
  expenseReimbursementController.getRequests,
);
router.put(
  '/:id/approve',
  authMiddleware.authorize('manage', 'Reimbursements'),
  expenseReimbursementController.approveRequest,
);
router.put(
  '/:id/reject',
  authMiddleware.authorize('manage', 'Reimbursements'),
  expenseReimbursementController.rejectRequest,
);

export default router;
