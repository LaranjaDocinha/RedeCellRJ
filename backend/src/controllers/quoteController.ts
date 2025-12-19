import { Request, Response } from 'express';
import { quoteService } from '../services/quoteService.js';
import { z } from 'zod';

// Zod Schemas
const quoteItemSchema = z.object({
  product_id: z.number().int().positive(),
  variation_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
});

export const createQuoteSchema = z.object({
  customer_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  valid_until: z.string().datetime(),
  items: z.array(quoteItemSchema).min(1),
  notes: z.string().optional(),
});

export const updateQuoteSchema = z
  .object({
    customer_id: z.number().int().positive().optional(),
    user_id: z.number().int().positive().optional(),
    valid_until: z.string().datetime().optional(),
    items: z.array(quoteItemSchema).min(1).optional(),
    notes: z.string().optional(),
    status: z.enum(['pending', 'accepted', 'rejected', 'expired']).optional(),
  })
  .partial();

export const createQuote = async (req: Request, res: Response) => {
  try {
    const validatedData = createQuoteSchema.parse(req.body);
    const newQuote = await quoteService.createQuote(validatedData);
    res.status(201).json(newQuote);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getQuoteById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const quote = await quoteService.getQuoteById(id);
    if (!quote) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }
    res.status(200).json(quote);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllQuotes = async (req: Request, res: Response) => {
  try {
    const quotes = await quoteService.getAllQuotes();
    res.status(200).json(quotes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuote = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const validatedData = updateQuoteSchema.parse(req.body);
    const updatedQuote = await quoteService.updateQuote(id, validatedData);
    if (!updatedQuote) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }
    res.status(200).json(updatedQuote);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuote = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const deleted = await quoteService.deleteQuote(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
