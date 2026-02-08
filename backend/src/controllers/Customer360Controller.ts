import { Request, Response } from 'express';
import { customer360Service } from '../services/customer360Service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const customer360Controller = {
  getTimeline: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const timeline = await customer360Service.getTimeline(Number(id));
    res.json(timeline);
  }),
};
