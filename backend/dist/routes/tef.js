import { Router } from 'express';
import { z } from 'zod';
const tefRouter = Router();
// Zod Schema for TEF transaction processing request
const processTefTransactionSchema = z.object({
    transactionId: z.string().uuid('Invalid transaction ID format'),
    amount: z.number().positive('Amount must be a positive number'),
    paymentMethod: z.enum(['credit_card', 'debit_card']),
    cardBrand: z.string().optional(),
    nsu: z.string().optional(),
    authorizationCode: z.string().optional(),
    installments: z.number().int().positive('Installments must be a positive integer').optional(),
    status: z.enum(['approved', 'denied', 'pending']),
    saleId: z.string().uuid('Invalid sale ID format').optional(),
});
// TODO: As funções do controller para estas rotas não foram encontradas. Rotas comentadas.
// // Route to process an incoming TEF transaction (from local TEF client)
// tefRouter.post(
//   '/transaction',
//   authMiddleware.authenticate,
//   authMiddleware.authorize('create', 'TefTransaction'), // Assuming 'TefTransaction' subject
//   validate(processTefTransactionSchema),
//   processTefTransaction,
// );
// // Route to get the status of a TEF transaction
// tefRouter.get(
//   '/status/:transactionId',
//   authMiddleware.authenticate,
//   authMiddleware.authorize('read', 'TefTransaction'), // Assuming 'TefTransaction' subject
//   getTefTransactionStatus,
// );
export default tefRouter;
