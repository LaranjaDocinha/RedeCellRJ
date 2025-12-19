import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/apiKeyService.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

// Zod schema for API Key permissions (simplified)
const permissionsSchema = z.record(z.array(z.string())); // e.g., { "products": ["read", "write"] }

const createApiKeySchema = z.object({
  name: z.string().min(3, 'Name is required and must be at least 3 characters.'),
  permissions: permissionsSchema.optional().default({}),
  expires_at: z.string().datetime().optional().nullable(),
});

const updateApiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').optional(),
  permissions: permissionsSchema.optional(),
  expires_at: z.string().datetime().optional().nullable(),
  is_active: z.boolean().optional(),
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
