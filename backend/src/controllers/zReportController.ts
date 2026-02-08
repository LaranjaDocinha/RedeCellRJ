import { Request, Response } from 'express';
import { zReportService } from '../services/zReportService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { z } from 'zod';
import { sendSuccess } from '../utils/responseHelper.js';

// Zod Schema for getZReport
export const getZReportSchema = z.object({
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
});

export const generateZReport = catchAsync(async (req: Request, res: Response) => {
  const validatedQuery = getZReportSchema.parse(req.query);
  const { startDate, endDate } = validatedQuery;

  // Default to current day if dates are not provided
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0); // Start of the day

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999); // End of the day

  const report = await zReportService.generateZReport(start, end);
  sendSuccess(res, report);
});
