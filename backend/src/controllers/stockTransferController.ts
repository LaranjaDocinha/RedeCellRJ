import { Request, Response, NextFunction } from 'express';
import * as stockTransferService from '../services/stockTransferService.js';
import { AppError } from '../utils/errors.js'; // Assuming AppError exists

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
