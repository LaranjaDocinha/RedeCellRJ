import { Request, Response } from 'express';
import * as clvService from '../services/clvService.js';

export const getClvReport = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const clvReport = await clvService.calculateClv(customerId);
    res.status(200).json(clvReport);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
