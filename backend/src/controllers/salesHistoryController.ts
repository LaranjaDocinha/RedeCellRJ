import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as salesHistoryService from '../services/salesHistoryService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getSalesHistoryController = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, customerId, userId, page, limit } = req.query;

  const result = await salesHistoryService.getSalesHistory({
    startDate: startDate as string,
    endDate: endDate as string,
    customerId: customerId as string,
    userId: userId as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.status(httpStatus.OK).send(result);
});

export const getSaleDetailsController = catchAsync(async (req: Request, res: Response) => {
  const { saleId } = req.params;
  const saleDetails = await salesHistoryService.getSaleDetails(saleId);
  res.status(httpStatus.OK).send(saleDetails);
});
