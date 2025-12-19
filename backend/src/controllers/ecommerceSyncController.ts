import { Request, Response } from 'express';
import * as ecommerceSyncService from '../services/ecommerceSyncService.js';

export const syncProducts = async (req: Request, res: Response) => {
  try {
    const result = await ecommerceSyncService.syncProductsToEcommerce(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncOrders = async (req: Request, res: Response) => {
  try {
    const result = await ecommerceSyncService.syncOrdersFromEcommerce();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await ecommerceSyncService.getEcommerceSyncStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
