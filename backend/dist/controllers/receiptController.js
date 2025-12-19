import httpStatus from 'http-status';
import { receiptService } from '../services/receiptService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { z } from 'zod';
// Zod Schemas
export const sendEmailSchema = z.object({
    to: z.string().email('Invalid email format'),
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
});
export const getSaleReceipt = catchAsync(async (req, res) => {
    const { saleId } = req.params;
    const receiptContent = await receiptService.generateReceipt(saleId);
    res.status(httpStatus.OK).send(receiptContent);
});
export const generateSaleFiscalNote = catchAsync(async (req, res) => {
    const { saleId } = req.params;
    const fiscalNoteContent = await receiptService.generateFiscalNote(saleId);
    res.status(httpStatus.OK).send(fiscalNoteContent);
});
export const sendDocumentByEmail = catchAsync(async (req, res) => {
    const { to, subject, htmlContent, textContent } = req.body;
    await receiptService.sendDocumentByEmail(to, subject, htmlContent, textContent);
    res.status(httpStatus.OK).send({ message: 'Email sent successfully' });
});
