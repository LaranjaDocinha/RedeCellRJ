import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { tefService } from '../services/tefService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

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
  res.status(httpStatus.OK).send(result);
});

export const getTefTransactionStatus = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.params; // Already validated by schema
  const status = await tefService.getTefTransactionStatus(transactionId);
  res.status(httpStatus.OK).send({ status });
});
