import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import Stripe from 'stripe';
import { AppError } from '../../../src/utils/errors.js';

// Mock the Stripe library
const mockStripe = {
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
};

// Mock the Stripe constructor to return our mock object
vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));

describe('PaymentService', () => {
  let paymentService: any;

  beforeAll(async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    const module = await import('../../../src/services/paymentService.js');
    paymentService = module.paymentService;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the Stripe constructor mock for each test to ensure fresh instance
    vi.mocked(Stripe).mockClear();
  });

  describe('createPaymentIntent', () => {
    it('should call stripeGateway.createPaymentIntent for stripe payment method type', async () => {
      const mockPaymentIntent = { id: 'pi_123', amount: 100, currency: 'usd' };
      mockStripe.paymentIntents.create.mockResolvedValueOnce(mockPaymentIntent);

      const amount = 1000; // cents
      const currency = 'usd';
      const metadata = { orderId: 'ord_xyz' };

      const result = await paymentService.createPaymentIntent(amount, currency, 'stripe', metadata);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata,
      });
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should throw AppError for unsupported payment method type in createPaymentIntent', async () => {
      const amount = 1000;
      const currency = 'usd';

      await expect(paymentService.createPaymentIntent(amount, currency, 'paypal')).rejects.toThrow(
        new AppError('Unsupported payment method type', 400),
      );
      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it('should rethrow error if stripe.paymentIntents.create fails', async () => {
      const stripeError = new Error('Stripe API error');
      mockStripe.paymentIntents.create.mockRejectedValueOnce(stripeError);

      const amount = 1000;
      const currency = 'usd';

      await expect(paymentService.createPaymentIntent(amount, currency, 'stripe')).rejects.toThrow(
        stripeError,
      );
    });
  });

  describe('confirmPayment', () => {
    it('should call stripeGateway.confirmPayment for stripe payment method type', async () => {
      const mockPaymentIntent = { id: 'pi_123_confirmed', status: 'succeeded' };
      mockStripe.paymentIntents.retrieve.mockResolvedValueOnce(mockPaymentIntent);

      const paymentIntentId = 'pi_123';

      const result = await paymentService.confirmPayment(paymentIntentId, 'stripe');

      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith(paymentIntentId);
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should throw AppError for unsupported payment method type in confirmPayment', async () => {
      const paymentIntentId = 'pi_123';

      await expect(paymentService.confirmPayment(paymentIntentId, 'paypal')).rejects.toThrow(
        new AppError('Unsupported payment method type', 400),
      );
      expect(mockStripe.paymentIntents.retrieve).not.toHaveBeenCalled();
    });

    it('should rethrow error if stripe.paymentIntents.retrieve fails', async () => {
      const stripeError = new Error('Stripe API error');
      mockStripe.paymentIntents.retrieve.mockRejectedValueOnce(stripeError);

      const paymentIntentId = 'pi_123';

      await expect(paymentService.confirmPayment(paymentIntentId, 'stripe')).rejects.toThrow(
        stripeError,
      );
    });
  });
});
