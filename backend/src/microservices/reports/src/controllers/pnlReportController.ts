import { Request, Response, NextFunction } from 'express';
import pnlReportService from '../services/pnlReportService.js';

export const getPnlReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    const pnlData = await pnlReportService.generatePnlReport(
      startDate as string,
      endDate as string,
    );

    res.status(200).json(pnlData);
  } catch (error) {
    next(error);
  }
};
