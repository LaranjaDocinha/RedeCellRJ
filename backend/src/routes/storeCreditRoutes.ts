import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  addStoreCredit,
  debitStoreCredit,
  getStoreCreditHistory,
} from '../controllers/storeCreditController.js';

const storeCreditRouter = Router();

// Store Credit Routes
storeCreditRouter.post(
  '/:customerId/credit/add',
  authMiddleware.authorize('create', 'StoreCredit'),
  addStoreCredit,
);
storeCreditRouter.post(
  '/:customerId/credit/debit',
  authMiddleware.authorize('create', 'StoreCredit'),
  debitStoreCredit,
);
storeCreditRouter.get(
  '/:customerId/credit/history',
  authMiddleware.authorize('read', 'StoreCredit'),
  getStoreCreditHistory,
);

export default storeCreditRouter;
