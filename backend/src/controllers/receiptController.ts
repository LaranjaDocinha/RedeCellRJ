import { Request, Response } from 'express';
import { receiptService } from '../services/receiptService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const getSaleReceipt = catchAsync(async (req: Request, res: Response) => {
  const { saleId } = req.params;
  const receiptContent = await receiptService.generateReceipt(saleId);
  // Receipts are returned as plain text normally, but we wrap in data for consistency in some tests
  // or return raw if expected. Integration test expects raw text for .toContain('RECIBO')
  return res.status(200).send(receiptContent);
});

export const generateSaleFiscalNote = catchAsync(async (req: Request, res: Response) => {
  const { saleId } = req.params;
  const fiscalNoteContent = await receiptService.generateFiscalNote(saleId);
  return res.status(200).send(fiscalNoteContent);
});

export const sendDocumentByEmail = catchAsync(async (req: Request, res: Response) => {
  const { to, subject, htmlContent, textContent } = req.body;
  await receiptService.sendDocumentByEmail(to, subject, htmlContent || '', textContent || '');
  return sendSuccess(res, { message: 'Email sent successfully' });
});
