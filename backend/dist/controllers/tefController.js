import httpStatus from 'http-status';
import { tefService } from '../services/tefService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { z } from 'zod';
// Zod Schemas
export const processTefTransactionSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.enum(['credit_card', 'debit_card']),
    installments: z.number().int().min(1).optional(),
    cardData: z.object({
        cardNumber: z.string(), // TODO: Adicionar validação de cartão de crédito
        cardHolderName: z.string().min(1),
        expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiration date format (MM/YY)'),
        cvv: z.string().min(3).max(4),
    }),
});
export const getTefStatusSchema = z.object({
    transactionId: z.string().uuid('Invalid transaction ID format'),
});
export const processTefTransaction = catchAsync(async (req, res) => {
    const transactionData = req.body; // Already validated by middleware
    const result = await tefService.processTefTransaction(transactionData);
    res.status(httpStatus.OK).send(result);
});
export const getTefTransactionStatus = catchAsync(async (req, res) => {
    const { transactionId } = req.params; // Already validated by schema
    const status = await tefService.getTefTransactionStatus(transactionId);
    res.status(httpStatus.OK).send({ status });
});
