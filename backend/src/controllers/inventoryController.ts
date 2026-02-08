import { Request, Response } from 'express';
import { demandForecastingService } from '../services/demandForecastingService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const inventoryController = {
  getPurchaseSuggestions: catchAsync(async (req: Request, res: Response) => {
    const suggestions = await demandForecastingService.getPurchaseSuggestions();
    res.json(suggestions);
  }),
};
