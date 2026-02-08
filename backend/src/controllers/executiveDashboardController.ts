import { Request, Response } from 'express';
import { pdfReportService } from '../services/pdfReportService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { executiveDashboardService } from '../services/executiveDashboardService.js';
import { competitorPriceService } from '../services/competitorPriceService.js';
import { repairAnalyticsService } from '../services/repairAnalyticsService.js';

export const executiveDashboardController = {
  getStats: catchAsync(async (req: Request, res: Response) => {
    const stats = await executiveDashboardService.getStats();
    const marketSuggestions = await competitorPriceService.getMarketOpportunities();
    const repairTrends = await repairAnalyticsService.getRepairTrends();

    res.json({ ...stats, marketSuggestions, repairTrends });
  }),

  downloadInfographic: catchAsync(async (req: Request, res: Response) => {
    const pdfBuffer = await pdfReportService.generateExecutiveInfographic();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_executivo_premium.pdf');
    res.send(Buffer.from(pdfBuffer));
  }),
};
