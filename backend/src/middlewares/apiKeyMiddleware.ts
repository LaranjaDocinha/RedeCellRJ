import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/apiKeyService.js';
import { AppError } from '../utils/errors.js';

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const rawApiKey = req.headers['x-api-key'] as string;

  if (!rawApiKey) {
    return next(new AppError('API Key missing', 401));
  }

  try {
    const apiKey = await apiKeyService.getApiKeyByRawKey(rawApiKey);
    if (!apiKey) {
      return next(new AppError('Invalid or expired API Key', 401));
    }

    // Attach API Key details to request for authorization checks later
    (req as any).apiKey = apiKey;
    next();
  } catch (error) {
    next(error);
  }
};
