import { Request, Response, NextFunction } from 'express';
import { publicPortalService } from '../services/publicPortalService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const publicPortalController = {
  getOrderByToken: catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const order = await publicPortalService.getOrderByToken(token);
    res.json(order);
  }),

  authenticate: catchAsync(async (req: Request, res: Response) => {
    const { osId, identity } = req.body;
    if (!osId || !identity) {
        res.status(400).json({ message: 'OS ID and Identity (CPF/Phone) are required' });
        return;
    }
    const result = await publicPortalService.authenticateCustomer(Number(osId), String(identity));
    res.json(result);
  }),

  updateApproval: catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { status, feedback } = req.body;
    const result = await publicPortalService.updateApproval(token, status, feedback);
    res.json(result);
  }),
};
