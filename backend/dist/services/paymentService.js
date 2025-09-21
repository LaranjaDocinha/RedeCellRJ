var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Stripe from 'stripe';
import { AppError } from '../utils/errors.js';
class StripePaymentGateway {
    constructor(secretKey) {
        this.stripe = new Stripe(secretKey, {
            apiVersion: '2024-06-20',
        });
    }
    createPaymentIntent(amount, currency, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentIntent = yield this.stripe.paymentIntents.create({
                    amount,
                    currency,
                    automatic_payment_methods: { enabled: true },
                    metadata,
                });
                return paymentIntent;
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
        });
    }
    confirmPayment(paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentIntent = yield this.stripe.paymentIntents.retrieve(paymentIntentId);
                return paymentIntent;
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
        });
    }
}
// Initialize Stripe Gateway
const stripeGateway = new StripePaymentGateway(process.env.STRIPE_SECRET_KEY || '');
export const paymentService = {
    createPaymentIntent(amount_1, currency_1) {
        return __awaiter(this, arguments, void 0, function* (amount, currency, paymentMethodType = 'stripe', metadata) {
            switch (paymentMethodType) {
                case 'stripe':
                    return stripeGateway.createPaymentIntent(amount, currency, metadata);
                default:
                    throw new AppError('Unsupported payment method type', 400);
            }
        });
    },
    confirmPayment(paymentIntentId_1) {
        return __awaiter(this, arguments, void 0, function* (paymentIntentId, paymentMethodType = 'stripe') {
            switch (paymentMethodType) {
                case 'stripe':
                    return stripeGateway.confirmPayment(paymentIntentId);
                default:
                    throw new AppError('Unsupported payment method type', 400);
            }
        });
    },
};
