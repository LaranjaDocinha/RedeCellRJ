import { Request, Response } from 'express';
import * as buybackService from '../services/buybackService.js';

export const calculateBuybackValue = async (req: Request, res: Response) => {
  try {
    const { deviceId, purchaseDate } = req.query;
    if (!deviceId || !purchaseDate) {
      return res.status(400).json({ message: 'Device ID and purchase date are required.' });
    }
    const result = await buybackService.getBuybackValue(
      parseInt(deviceId as string, 10),
      new Date(purchaseDate as string),
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const initiateBuyback = async (req: Request, res: Response) => {
  try {
    const { customerId, deviceId, buybackValue } = req.body;
    const result = await buybackService.initiateBuyback(
      parseInt(customerId, 10),
      parseInt(deviceId, 10),
      parseFloat(buybackValue),
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
