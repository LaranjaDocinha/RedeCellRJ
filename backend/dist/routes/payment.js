var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { paymentService } from '../services/paymentService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';
import { z } from 'zod';
const router = Router();
// Zod Schemas
const createPaymentIntentSchema = z.object({
    amount: z.number().int().positive('Amount must be a positive integer'),
    currency: z.string().length(3).nonempty('Currency is required'),
});
const confirmPaymentSchema = z.object({
    paymentIntentId: z.string().nonempty('Payment Intent ID is required'),
});
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
router.post('/create-payment-intent', authMiddleware.authenticate, authMiddleware.authorize('create', 'Payment'), validate(createPaymentIntentSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency } = req.body;
        const paymentIntent = yield paymentService.createPaymentIntent(amount, currency);
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/confirm-payment', authMiddleware.authenticate, authMiddleware.authorize('update', 'Payment'), validate(confirmPaymentSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentIntentId } = req.body;
        const paymentIntent = yield paymentService.confirmPayment(paymentIntentId);
        res.status(200).json({ status: paymentIntent.status });
    }
    catch (error) {
        next(error);
    }
}));
export default router;
