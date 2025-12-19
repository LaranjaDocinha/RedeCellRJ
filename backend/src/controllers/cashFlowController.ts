import { Request, Response } from 'express';
import * as cashFlowService from '../services/cashFlowService.js';
import moment from 'moment';

export const getCashFlow = async (req: Request, res: Response) => {
  try {
    const { branchId, startDate, endDate } = req.query;

    const start = startDate
      ? moment(startDate as string).toISOString()
      : moment().startOf('month').toISOString();
    const end = endDate
      ? moment(endDate as string).toISOString()
      : moment().endOf('month').toISOString();

    const data = await cashFlowService.getCashFlowData(
      branchId ? parseInt(branchId as string, 10) : undefined,
      start,
      end,
    );
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
