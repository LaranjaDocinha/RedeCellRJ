import { Request, Response } from 'express';
import { whatIfService } from '../services/whatIfService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const whatIfController = {
  runSimulation: catchAsync(async (req: Request, res: Response) => {
    const { printPriceMultiplier, salesVolumeMultiplier, costMultiplier } = req.query as any;

    const result = await whatIfService.simulate({
      printPriceMultiplier: Number(printPriceMultiplier) || 1,
      salesVolumeMultiplier: Number(salesVolumeMultiplier) || 1,
      costMultiplier: Number(costMultiplier) || 1,
    });

    res.json(result);
  }),
};
