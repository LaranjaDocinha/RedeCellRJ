import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import * as hardwareController from '../controllers/hardwareController.js';
import { z } from 'zod'; // For inline schema validation if needed

const hardwareRouter = Router();

// Middleware de autenticação para todas as rotas de hardware
hardwareRouter.use(authMiddleware.authenticate);

// Rota para ler a balança
hardwareRouter.get('/scale/read', hardwareController.getScaleReading);

// Rota para processar pagamento TEF
const tefPaymentSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  paymentType: z.enum(['credit', 'debit'], {
    errorMap: () => ({ message: 'Payment type must be "credit" or "debit"' }),
  }),
});
hardwareRouter.post(
  '/tef/process',
  validate(tefPaymentSchema),
  hardwareController.processTefPayment,
);

export default hardwareRouter;
