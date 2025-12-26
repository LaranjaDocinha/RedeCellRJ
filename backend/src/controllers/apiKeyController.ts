import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/apiKeyService.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

// Zod validation schemas
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expires_at: z.string().datetime().optional(),
});

export const updateApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  status: z.enum(['active', 'revoked']).optional(),
}).partial();

export const apiKeyController = {
  async generateApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const validatedData = createApiKeySchema.parse(req.body);
      const { rawKey, apiKey } = await apiKeyService.generateApiKey({ ...validatedData, user_id: userId });
      res.status(201).json({ rawKey, apiKey }); // Return raw key ONLY ONCE
    } catch (error) {
      next(error);
    }
  },

  async getUserApiKeys(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const keys = await apiKeyService.getUserApiKeys(userId);
      res.json(keys);
    } catch (error) {
      next(error);
    }
  },

  async updateApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid API Key ID', 400);
      }
      const validatedData = updateApiKeySchema.parse(req.body);
      const updatedKey = await apiKeyService.updateApiKey(id, validatedData);
      res.json(updatedKey);
    } catch (error) {
      next(error);
    }
  },

  async deleteApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid API Key ID', 400);
      }
      await apiKeyService.deleteApiKey(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
