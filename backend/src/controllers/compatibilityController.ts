import { Request, Response } from 'express';
import { compatibilityService } from '../services/compatibilityService.js';

export const getCompatibilities = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let results;
    if (search) {
      results = await compatibilityService.search(search as string, category as string);
    } else {
      results = await compatibilityService.getAll(category as string);
    }
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCompatibility = async (req: Request, res: Response) => {
  try {
    const result = await compatibilityService.create(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
