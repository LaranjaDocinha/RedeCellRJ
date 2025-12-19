import { Request, Response } from 'express';
import { techAppService } from '../services/techAppService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';

export const techAppController = {
  getOpenOrders: catchAsync(async (req: Request, res: Response) => {
    const branchId = req.user?.branchId || 1; // Default branch se não tiver
    const userId = req.user?.id;
    
    const orders = await techAppService.getOpenOrders(branchId, userId);
    res.json(orders);
  }),

  addPhoto: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { url, type } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new AppError('User not authenticated', 401);
    if (!url || !type) throw new AppError('URL and Type are required', 400);

    const photo = await techAppService.addServicePhoto({
        serviceOrderId: Number(id),
        url,
        type,
        userId
    });
    res.status(201).json(photo);
  }),

  getChecklistTemplate: catchAsync(async (req: Request, res: Response) => {
    const type = req.query.type as 'pre-repair' | 'post-repair' || 'pre-repair';
    const template = await techAppService.getChecklistTemplate(type);
    res.json(template);
  }),

  submitChecklist: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const checklistData = req.body;
    const userId = req.user?.id;

    if (!userId) throw new AppError('User not authenticated', 401);

    await techAppService.submitChecklist(Number(id), checklistData, userId);
    res.json({ success: true });
  })
};
