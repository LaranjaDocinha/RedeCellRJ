import { Request, Response } from 'express';
import * as googleShoppingService from '../services/googleShoppingService.js';

export const syncProducts = async (req: Request, res: Response) => {
  try {
    const { productsData } = req.body;
    const result = await googleShoppingService.syncProductFeed(productsData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await googleShoppingService.getGoogleShoppingStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
