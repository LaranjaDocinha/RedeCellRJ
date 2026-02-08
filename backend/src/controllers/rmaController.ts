import { Request, Response } from 'express';
import { rmaService } from '../services/rmaService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const rmaController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const { supplierId, items, notes } = req.body;
    const rma = await rmaService.createRmaRequest(Number(supplierId), items, notes);
    res.status(201).json(rma);
  }),

  downloadBorderou: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pdfBuffer = await rmaService.generateBorderou(Number(id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bordero_rma_${id}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  }),
};
