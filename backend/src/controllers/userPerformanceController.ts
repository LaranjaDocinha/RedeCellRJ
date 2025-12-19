import { Request, Response } from 'express';
import * as userPerformanceService from '../services/userPerformanceService.js';
import moment from 'moment';

export const getMyPerformance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { startDate, endDate } = req.query;

    // Default to the current month if no date range is provided
    const start = startDate
      ? moment(startDate as string).toISOString()
      : moment().startOf('month').toISOString();
    const end = endDate
      ? moment(endDate as string).toISOString()
      : moment().endOf('month').toISOString();

    const performanceData = await userPerformanceService.getPerformanceData(
      String(userId),
      start,
      end,
    );
    res.json(performanceData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
