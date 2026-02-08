import { Request, Response } from 'express';
import { reconciliationService } from '../services/reconciliationService.js';
import { AppError } from '../utils/errors.js';
import { catchAsync } from '../utils/catchAsync.js';
import fs from 'fs';

export const financeController = {
  uploadOfx: catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('Arquivo OFX é obrigatório', 400);
    }

    const ofxContent = fs.readFileSync(req.file.path, 'utf8');
    const reconciliation = await reconciliationService.processOfx(ofxContent);

    // Remove o arquivo temporário
    fs.unlinkSync(req.file.path);

    res.json(reconciliation);
  }),
};
