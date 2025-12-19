import { Request, Response } from 'express';
import { userKeybindService } from '../services/userKeybindService.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

// Zod schemas for validation
const createKeybindSchema = z.object({
  action_name: z.string().min(1, 'Action name is required'),
  key_combination: z.string().min(1, 'Key combination is required'),
  context: z.string().optional(),
});

const updateKeybindSchema = z.object({
  key_combination: z.string().min(1, 'Key combination is required').optional(),
  context: z.string().optional(),
}).partial();

export const userKeybindController = {
  async getUserKeybinds(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const context = req.query.context as string | undefined;
      const keybinds = await userKeybindService.getUserKeybinds(userId, context);
      res.json(keybinds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async createKeybind(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const validatedData = createKeybindSchema.parse(req.body);
      const newKeybind = await userKeybindService.createKeybind({ ...validatedData, user_id: userId });
      res.status(201).json(newKeybind);
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

  async updateKeybind(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id; // Ensure user owns the keybind
      const id = parseInt(req.params.id, 10);
      const validatedData = updateKeybindSchema.parse(req.body);
      
      const existingKeybind = await userKeybindService.getUserKeybinds(userId);
      const keybindToUpdate = existingKeybind.find(kb => kb.id === id);

      if (!keybindToUpdate) {
          return res.status(404).json({ message: 'Keybind not found or not owned by user.' });
      }

      const updatedKeybind = await userKeybindService.updateKeybind(id, validatedData);
      res.json(updatedKeybind);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  },

  async deleteKeybind(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id; // Ensure user owns the keybind
      const id = parseInt(req.params.id, 10);

      const existingKeybind = await userKeybindService.getUserKeybinds(userId);
      const keybindToDelete = existingKeybind.find(kb => kb.id === id);

      if (!keybindToDelete) {
          return res.status(404).json({ message: 'Keybind not found or not owned by user.' });
      }

      await userKeybindService.deleteKeybind(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
