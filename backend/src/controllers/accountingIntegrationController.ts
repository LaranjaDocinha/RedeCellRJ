import { Request, Response } from 'express';
import * as accountingIntegrationService from '../services/accountingIntegrationService.js';

export const syncSales = async (req: Request, res: Response) => {
  try {
    const result = await accountingIntegrationService.syncSales(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncExpenses = async (req: Request, res: Response) => {
  try {
    const result = await accountingIntegrationService.syncExpenses(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await accountingIntegrationService.getIntegrationStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
