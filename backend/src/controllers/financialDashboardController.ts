import { Request, Response } from 'express';
import * as financialDashboardService from '../services/financialDashboardService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const getFinancialDashboardData = catchAsync(async (req: Request, res: Response) => {
  const dashboardData = await financialDashboardService.getFinancialDashboardData();
  sendSuccess(res, dashboardData);
});
