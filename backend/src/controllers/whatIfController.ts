import { Request, Response } from 'express';
import * as whatIfService from '../services/whatIfService.js';

export const simulatePromotion = async (req: Request, res: Response) => {
  try {
    const simulationDetails = req.body;
    const result = await whatIfService.simulatePromotion(simulationDetails);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
