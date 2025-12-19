import Stripe from 'stripe';
import { AppError } from '../utils/errors.js';
class StripePaymentGateway {
    constructor(secretKey) {
        if (!secretKey) {
            // This is a critical configuration error. The application cannot start without it.
            throw new Error('Stripe secret key is not configured. Please set the STRIPE_SECRET_KEY environment variable.');
        }
        this.stripe = new Stripe(secretKey, {
            apiVersion: '2024-06-20',
        });
    }
    async createPaymentIntent(amount, currency, metadata) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
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
    }
    async confirmPayment(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
    }
}
// Initialize Stripe Gateway
const stripeGateway = new StripePaymentGateway(process.env.STRIPE_SECRET_KEY || '');
export const paymentService = {
    async createPaymentIntent(amount, currency, paymentMethodType = 'stripe', metadata) {
        switch (paymentMethodType) {
            case 'stripe':
                return stripeGateway.createPaymentIntent(amount, currency, metadata);
            default:
                throw new AppError('Unsupported payment method type', 400);
        }
    },
    async confirmPayment(paymentIntentId, paymentMethodType = 'stripe') {
        switch (paymentMethodType) {
            case 'stripe':
                return stripeGateway.confirmPayment(paymentIntentId);
            default:
                throw new AppError('Unsupported payment method type', 400);
        }
    },
};
