import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { cashDrawerService } from '../services/cashDrawerService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const openCashDrawer = catchAsync(async (req: Request, res: Response) => {
  const result = await cashDrawerService.openCashDrawer();
  res.status(httpStatus.OK).send(result);
});
