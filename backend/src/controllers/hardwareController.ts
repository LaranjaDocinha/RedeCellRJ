import { Request, Response, NextFunction } from 'express';
import * as hardwareService from '../services/hardwareService.js';
import { z } from 'zod';
import { validate } from '../middlewares/validationMiddleware.js'; // Assuming validationMiddleware exists
import { AppError } from '../utils/errors.js'; // Assuming AppError exists

const tefSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  paymentType: z.enum(['credit', 'debit'], {
    errorMap: () => ({ message: 'Payment type must be "credit" or "debit"' }),
  }),
});

export const getScaleReading = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weight = await hardwareService.simulateScaleReading();
    res.status(200).json({ weight });
  } catch (error) {
    next(error);
  }
};

export const processTefPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, paymentType } = req.body;
    const result = await hardwareService.processTefPayment(amount, paymentType);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
