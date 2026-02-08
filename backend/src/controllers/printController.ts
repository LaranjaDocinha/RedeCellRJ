import { Request, Response } from 'express';
import { printService } from '../services/printService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const printController = {
  calculate: catchAsync(async (req: Request, res: Response) => {
    const { pages, config } = req.body;
    const cost = await printService.calculateCost(pages, config);
    res.json(cost);
  }),

  createJob: catchAsync(async (req: Request, res: Response) => {
    const job = await printService.createJob(req.body);
    res.status(201).json(job);
  }),

  listJobs: catchAsync(async (req: Request, res: Response) => {
    const jobs = await printService.listJobs();
    res.json(jobs);
  }),

  updateStatus: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const job = await printService.updateJobStatus(Number(id), status);
    res.json(job);
  }),

  notifyCustomer: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await printService.notifyCustomer(Number(id));
    res.json(result);
  }),
};
