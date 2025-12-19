import { Request, Response } from 'express';
import * as financialDashboardService from '../services/financialDashboardService.js';

export const getFinancialDashboardData = async (req: Request, res: Response) => {
  try {
    const dashboardData = await financialDashboardService.getFinancialDashboardData();
    res.status(200).json(dashboardData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
