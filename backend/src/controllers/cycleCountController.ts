import { Request, Response } from 'express';
import { cycleCountService } from '../services/cycleCountService.js';
import { z } from 'zod';

// Zod Schemas
const cycleCountItemSchema = z.object({
  product_variation_id: z.number().int().positive(),
  counted_quantity: z.number().int().min(0),
  notes: z.string().optional().nullable(),
});

export const createCycleCountSchema = z.object({
  branch_id: z.number().int().positive(),
  notes: z.string().optional().nullable(),
  items: z.array(cycleCountItemSchema).min(1),
});

export const updateCycleCountSchema = z
  .object({
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    notes: z.string().optional().nullable(),
    items: z.array(cycleCountItemSchema).min(1).optional(),
  })
  .partial();

export const createCycleCount = async (req: Request, res: Response) => {
  try {
    const validatedData = createCycleCountSchema.parse(req.body);
    const userId = (req as any).user?.id || 1; // Mock user ID
    const newCycleCount = await cycleCountService.createCycleCount({
      ...validatedData,
      counted_by_user_id: userId,
    });
    res.status(201).json(newCycleCount);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getCycleCountById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const cycleCount = await cycleCountService.getCycleCountById(id);
    if (!cycleCount) {
      return res.status(404).json({ message: 'Contagem cíclica não encontrada.' });
    }
    res.status(200).json(cycleCount);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCycleCounts = async (req: Request, res: Response) => {
  try {
    const cycleCounts = await cycleCountService.getAllCycleCounts();
    res.status(200).json(cycleCounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCycleCount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const validatedData = updateCycleCountSchema.parse(req.body);
    const updatedCycleCount = await cycleCountService.updateCycleCount(id, validatedData);
    if (!updatedCycleCount) {
      return res.status(404).json({ message: 'Contagem cíclica não encontrada.' });
    }
    res.status(200).json(updatedCycleCount);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteCycleCount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const deleted = await cycleCountService.deleteCycleCount(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Contagem cíclica não encontrada.' });
    }
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
