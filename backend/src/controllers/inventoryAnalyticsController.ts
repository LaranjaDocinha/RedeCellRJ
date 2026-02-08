import { Request, Response } from 'express';
import { demandForecastingService } from '../services/demandForecastingService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ResponseHelper } from '../utils/responseHelper.js';

export const inventoryAnalyticsController = {
  /**
   * Retorna a análise Curva ABC dos produtos.
   */
  getABCAnalysis: catchAsync(async (req: Request, res: Response) => {
    const analysis = await demandForecastingService.getABCAnalysis();
    ResponseHelper.success(res, analysis);
  }),

  /**
   * Retorna sugestões de compra baseadas em demanda e classificação ABC.
   */
  getPurchaseSuggestions: catchAsync(async (req: Request, res: Response) => {
    const suggestions = await demandForecastingService.getPurchaseSuggestions();
    ResponseHelper.success(res, suggestions);
  }),
};
