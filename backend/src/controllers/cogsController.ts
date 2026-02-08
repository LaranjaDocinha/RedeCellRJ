import { Request, Response } from 'express';
import * as cogsService from '../services/cogsService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const getCogsReport = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const report = await cogsService.generateCogsReport(startDate as string, endDate as string);
  sendSuccess(res, report);
});
