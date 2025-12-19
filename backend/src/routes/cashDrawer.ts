import { Router } from 'express';
import { openCashDrawer } from '../controllers/cashDrawerController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const cashDrawerRouter = Router();

// Route to open the cash drawer
cashDrawerRouter.post(
  '/open',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'CashDrawer'), // Assuming 'CashDrawer' subject for authorization
  openCashDrawer,
);

export default cashDrawerRouter;
