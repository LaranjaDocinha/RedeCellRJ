import { Request, Response, NextFunction } from 'express';
import * as stockTransferService from '../services/stockTransferService.js';
import { z } from 'zod';
import { validate } from '../middlewares/validationMiddleware.js'; // Assuming validationMiddleware exists
import { AppError } from '../utils/errors.js'; // Assuming AppError exists

const requestTransferSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  variationId: z.number().int().positive('Variation ID must be a positive integer'),
  fromBranchId: z.number().int().positive('From Branch ID must be a positive integer'),
  toBranchId: z.number().int().positive('To Branch ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  requestedBy: z.number().int().positive('Requester User ID must be a positive integer'),
});

const approveRejectTransferSchema = z.object({
  approvedBy: z.number().int().positive('Approver User ID must be a positive integer'),
});

export const requestTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assuming requestedBy comes from authMiddleware (req.user.id)
    const userId = (req as any).user?.id || req.body.requestedBy; // Fallback for dev/testing
    if (!userId) throw new AppError('Requester user ID is missing.', 401);

    const transferData = { ...req.body, requestedBy: userId };
    const newTransfer = await stockTransferService.requestTransfer(transferData);
    res.status(201).json(newTransfer);
  } catch (error) {
    next(error);
  }
};

export const approveTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transferId = parseInt(req.params.id, 10);
    if (isNaN(transferId)) throw new AppError('Invalid transfer ID', 400);

    // Assuming approvedBy comes from authMiddleware (req.user.id)
    const userId = (req as any).user?.id || req.body.approvedBy; // Fallback for dev/testing
    if (!userId) throw new AppError('Approver user ID is missing.', 401);

    const approvedTransfer = await stockTransferService.approveTransfer(transferId, userId);
    res.status(200).json(approvedTransfer);
  } catch (error) {
    next(error);
  }
};

export const rejectTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transferId = parseInt(req.params.id, 10);
    if (isNaN(transferId)) throw new AppError('Invalid transfer ID', 400);

    // Assuming approvedBy comes from authMiddleware (req.user.id)
    const userId = (req as any).user?.id || req.body.approvedBy; // Fallback for dev/testing
    if (!userId) throw new AppError('Approver user ID is missing.', 401);

    const rejectedTransfer = await stockTransferService.rejectTransfer(transferId, userId);
    res.status(200).json(rejectedTransfer);
  } catch (error) {
    next(error);
  }
};

export const getPendingTransfers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingTransfers = await stockTransferService.getPendingTransfers();
    res.status(200).json(pendingTransfers);
  } catch (error) {
    next(error);
  }
};

export const getTransferHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
    const history = await stockTransferService.getTransferHistory(branchId);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};