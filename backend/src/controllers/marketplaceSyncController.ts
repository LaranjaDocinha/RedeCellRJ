import { Request, Response } from 'express';
import * as marketplaceSyncService from '../services/marketplaceSyncService.js';

export const syncProducts = async (req: Request, res: Response) => {
  try {
    const { marketplace, productsData } = req.body;
    const result = await marketplaceSyncService.syncProductsToMarketplace(
      productsData,
      marketplace,
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncOrders = async (req: Request, res: Response) => {
  try {
    const { marketplace } = req.body;
    const result = await marketplaceSyncService.syncOrdersFromMarketplace(marketplace);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const { marketplace } = req.query;
    if (!marketplace) {
      return res.status(400).json({ message: 'Marketplace parameter is required.' });
    }
    const status = await marketplaceSyncService.getMarketplaceSyncStatus(marketplace as string);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
