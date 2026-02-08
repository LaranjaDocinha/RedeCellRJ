import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';
import * as clvService from '../services/clvService.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const getClvReport = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.params.customerId || req.params.id;
  if (!customerId) {
    throw new AppError('Customer ID is required', 400);
  }
  const report = await clvService.calculateClv(customerId);
  sendSuccess(res, report);
});
