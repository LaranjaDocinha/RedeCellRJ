import { Request, Response } from 'express';
import { publicPortalService } from '../services/publicPortalService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const publicPortalController = {
  getOrderByToken: catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const order = await publicPortalService.getOrderByToken(token);
    return sendSuccess(res, order);
  }),

  authenticate: catchAsync(async (req: Request, res: Response) => {
    const { osId, identity } = req.body;
    if (!osId || !identity) {
      return sendError(res, 'OS ID and Identity (CPF/Phone) are required', 'VALIDATION_ERROR', 400);
    }
    const result = await publicPortalService.authenticateCustomer(Number(osId), String(identity));
    return sendSuccess(res, result);
  }),

  updateApproval: catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { status, feedback } = req.body;
    const result = await publicPortalService.updateApproval(token, status, feedback);
    return sendSuccess(res, result);
  }),
};
