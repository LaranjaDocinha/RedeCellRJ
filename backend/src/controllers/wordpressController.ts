import { Request, Response } from 'express';
import * as wordpressService from '../services/wordpressService.js';

export const syncProducts = async (req: Request, res: Response) => {
  try {
    const { productsData } = req.body;
    const result = await wordpressService.syncProductsToWordPress(productsData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncOrders = async (req: Request, res: Response) => {
  try {
    const result = await wordpressService.syncOrdersFromWordPress();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await wordpressService.getWordPressStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
