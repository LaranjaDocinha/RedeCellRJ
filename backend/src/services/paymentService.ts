import Stripe from 'stripe';
import { AppError } from '../utils/errors.js';

interface PaymentGateway {
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<any>;
  confirmPayment(paymentIntentId: string): Promise<any>;
  // Add other generic payment methods as needed
}

class StripePaymentGateway implements PaymentGateway {
  private stripe: Stripe;

  constructor(secretKey: string) {
    if (!secretKey) {
      // This is a critical configuration error. The application cannot start without it.
      throw new Error(
        'Stripe secret key is not configured. Please set the STRIPE_SECRET_KEY environment variable.',
      );
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    } as any);
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string | null>,
  ): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata,
      });
      return paymentIntent;
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error: unknown) {
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
  async createPaymentIntent(
    amount: number,
    currency: string,
    paymentMethodType: string = 'stripe',
    metadata?: Record<string, string | null>,
  ) {
    switch (paymentMethodType) {
      case 'stripe':
        return stripeGateway.createPaymentIntent(amount, currency, metadata);
      default:
        throw new AppError('Unsupported payment method type', 400);
    }
  },

  async confirmPayment(paymentIntentId: string, paymentMethodType: string = 'stripe') {
    switch (paymentMethodType) {
      case 'stripe':
        return stripeGateway.confirmPayment(paymentIntentId);
      default:
        throw new AppError('Unsupported payment method type', 400);
    }
  },
};
