import { Request, Response } from 'express';
import { ipWhitelistService } from '../services/ipWhitelistService.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

// Zod schemas
export const createIpEntrySchema = z.object({
  ip_address: z.string().ip({ message: 'Invalid IP address' }),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const updateIpEntrySchema = z.object({
  ip_address: z.string().ip({ message: 'Invalid IP address' }).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const ipWhitelistController = {
  async getAllEntries(req: Request, res: Response) {
    try {
      const entries = await ipWhitelistService.getAllEntries();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async createEntry(req: Request, res: Response) {
    try {
      const validatedData = createIpEntrySchema.parse(req.body);
      const newEntry = await ipWhitelistService.createEntry(validatedData);
      res.status(201).json(newEntry);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      if (error instanceof AppError && error.statusCode === 409) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  async updateEntry(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const validatedData = updateIpEntrySchema.parse(req.body);
      const updatedEntry = await ipWhitelistService.updateEntry(id, validatedData);
      res.json(updatedEntry);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  },

  async deleteEntry(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      await ipWhitelistService.deleteEntry(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
