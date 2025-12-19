import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { shiftReportService } from '../services/shiftReportService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

// Zod Schema for getShiftReport
export const getShiftReportSchema = z.object({
  shiftId: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive('Shift ID must be a positive integer')
  ).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});



export const getCurrentShiftReport = catchAsync(async (req: Request, res: Response) => {
  // In a real application, branchId would come from the authenticated user's context
  // For now, we'll use a default or a query parameter
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : 1; // Default to branch 1

  const report = await shiftReportService.getCurrentShiftReport(branchId);
  res.status(httpStatus.OK).send(report);
});
