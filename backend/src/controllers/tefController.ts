import { Request, Response } from 'express';
import { tefService } from '../services/tefService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { z } from 'zod';
import { sendSuccess } from '../utils/responseHelper.js';

// Zod Schemas
export const processTefTransactionSchema = z.object({
  transactionId: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['credit_card', 'debit_card']),
  cardBrand: z.string().optional(),
  nsu: z.string().optional(),
  authorizationCode: z.string().optional(),
  installments: z.number().int().min(1).optional(),
  status: z.string().optional(),
});

export const getTefStatusSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID format'),
});

export const processTefTransaction = catchAsync(async (req: Request, res: Response) => {
  const transactionData = req.body; // Already validated by middleware
  const result = await tefService.processTefTransaction(transactionData);
  sendSuccess(res, result);
});

export const getTefTransactionStatus = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.params; // Already validated by schema
  const status = await tefService.getTefTransactionStatus(transactionId);
  sendSuccess(res, { status });
});
