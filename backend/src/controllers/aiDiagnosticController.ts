import { Request, Response } from 'express';
import { aiDiagnosticService } from '../services/aiDiagnosticService.js';
import { AppError } from '../utils/errors.js';
import { catchAsync } from '../utils/catchAsync.js';

export const aiDiagnosticController = {
  analyze: catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('Nenhuma imagem enviada para análise.', 400);
    }

    const result = await aiDiagnosticService.analyzeImage(req.file.path);
    res.json(result);
  }),
};
