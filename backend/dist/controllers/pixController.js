import httpStatus from 'http-status';
import { pixService } from '../services/pixService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { z } from 'zod';
// Zod Schemas
export const generateQrCodeSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    transactionId: z.string().uuid('Invalid transaction ID format').optional(),
    description: z.string().optional(),
});
export const generatePixQrCode = catchAsync(async (req, res) => {
    const { amount, description } = req.body;
    const transactionId = `TXID-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`; // Generate a unique transaction ID
    const qrCodeData = await pixService.generateDynamicQrCode({ amount, transactionId, description });
    res.status(httpStatus.OK).send(qrCodeData);
});
export const checkPixPaymentStatus = catchAsync(async (req, res) => {
    const { transactionId } = req.params;
    const status = await pixService.checkPaymentStatus(transactionId);
    res.status(httpStatus.OK).send({ status });
});
export const handlePixWebhook = catchAsync(async (req, res) => {
    // In a real scenario, you'd validate the webhook signature/payload
    // and then process the payment confirmation.
    await pixService.handleWebhook(req.body);
    res.status(httpStatus.OK).send({ message: 'Webhook received and processed' });
});
