import { Request, Response } from 'express';
import * as arService from '../services/arService.js';

export const getCompatibleProducts = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const products = await arService.getCompatibleProducts(parseInt(deviceId, 10));
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logARInteraction = async (req: Request, res: Response) => {
  try {
    const { customerId, productId } = req.body;
    const result = await arService.logARInteraction(
      parseInt(customerId, 10),
      parseInt(productId, 10),
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
