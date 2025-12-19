import { Request, Response } from 'express';
import * as invoiceService from '../services/invoiceService.js';

export const generatePdf = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const result = await invoiceService.generateInvoicePdf(parseInt(invoiceId, 10));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDownloadLink = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const result = await invoiceService.getInvoiceDownloadLink(parseInt(invoiceId, 10));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
