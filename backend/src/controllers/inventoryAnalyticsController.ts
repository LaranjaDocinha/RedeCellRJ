import { Request, Response } from 'express';
import { demandForecastingService } from '../services/demandForecastingService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const inventoryAnalyticsController = {
  /**
   * Retorna a análise Curva ABC dos produtos.
   */
  getABCAnalysis: catchAsync(async (req: Request, res: Response) => {
    const analysis = await demandForecastingService.getABCAnalysis();
    res.json(analysis);
  }),

  /**
   * Retorna sugestões de compra baseadas em demanda e classificação ABC.
   */
  getPurchaseSuggestions: catchAsync(async (req: Request, res: Response) => {
    const suggestions = await demandForecastingService.getPurchaseSuggestions();
    res.json(suggestions);
  }),
};
