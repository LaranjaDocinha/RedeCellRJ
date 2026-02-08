import { Request, Response } from 'express';
import { aiHelpService } from '../services/aiHelpService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const aiHelpController = {
  chat: catchAsync(async (req: Request, res: Response) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'A pergunta é obrigatória.' });
    }
    const answer = await aiHelpService.getChatResponse(question);
    res.json({ answer });
  }),
};
