import { Request, Response } from 'express';
import { deliveryService } from '../services/deliveryService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const deliveryController = {
  getQuotes: catchAsync(async (req: Request, res: Response) => {
    const { originZip, destinationZip } = req.query as {
      originZip: string;
      destinationZip: string;
    };
    const quotes = await deliveryService.getQuote(originZip, destinationZip);
    res.json(quotes);
  }),

  createDelivery: catchAsync(async (req: Request, res: Response) => {
    const { orderId, provider, destinationZip } = req.body;
    const result = await deliveryService.requestDelivery(orderId, provider, destinationZip);
    res.json(result);
  }),
};
