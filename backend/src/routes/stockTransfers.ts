import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import * as stockTransferController from '../controllers/stockTransferController.js';
import { z } from 'zod'; // For inline schema validation if needed

const stockTransfersRouter = Router();

stockTransfersRouter.use(authMiddleware.authenticate); // All stock transfer routes require authentication

const requestTransferSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  variationId: z.number().int().positive('Variation ID must be a positive integer'),
  fromBranchId: z.number().int().positive('From Branch ID must be a positive integer'),
  toBranchId: z.number().int().positive('To Branch ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  // requestedBy will be picked from authMiddleware, so not needed in body schema
});

stockTransfersRouter.post(
  '/request',
  authMiddleware.authorize('create', 'StockTransfer'),
  validate(requestTransferSchema),
  stockTransferController.requestTransfer
);

stockTransfersRouter.post(
  '/:id/approve',
  authMiddleware.authorize('approve', 'StockTransfer'),
  stockTransferController.approveTransfer // approvedBy comes from authMiddleware
);

stockTransfersRouter.post(
  '/:id/reject',
  authMiddleware.authorize('reject', 'StockTransfer'),
  stockTransferController.rejectTransfer // approvedBy comes from authMiddleware
);

stockTransfersRouter.get(
  '/pending',
  authMiddleware.authorize('read', 'StockTransfer'),
  stockTransferController.getPendingTransfers
);

stockTransfersRouter.get(
  '/history',
  authMiddleware.authorize('read', 'StockTransfer'),
  stockTransferController.getTransferHistory
);

export default stockTransfersRouter;