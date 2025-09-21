import request from 'supertest';
import app from '../../src/index';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupIntegrationTestDatabase, teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';
import { authService } from '../../src/services/authService';

// Mock the Stripe library
vi.mock('stripe', () => {
  const mockPaymentIntent = {
    id: 'pi_mock_123',
    client_secret: 'cs_mock_123',
    status: 'succeeded',
  };

  // Mock the Stripe constructor
  const MockStripeConstructor = vi.fn(() => ({
    paymentIntents: {
      create: vi.fn(() => Promise.resolve(mockPaymentIntent)),
      retrieve: vi.fn(() => Promise.resolve(mockPaymentIntent)),
      confirm: vi.fn(() => Promise.resolve(mockPaymentIntent)),
    },
  }));
  return { default: MockStripeConstructor }; // Return the constructor function as default
});

import { getTestPool } from '../testPool';

describe('Payment API', () => {
  let authToken: string;
  let testUserId: number;

  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['users']);

    // Create a test user and get a token
    const userRes = await authService.register('testuser@payment.com', 'password123', 'user');
    authToken = userRes.token;
    testUserId = userRes.user.id;
  });

  it('should create a payment intent', async () => {
    const res = await request(app)
      .post('/api/payment/create-payment-intent')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 1000, currency: 'usd' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('clientSecret');
    expect(res.body.clientSecret).toBe('cs_mock_123');
  });

  it('should confirm a payment intent', async () => {
    const res = await request(app)
      .post('/api/payment/confirm-payment')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ paymentIntentId: 'pi_mock_123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('succeeded');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).post('/api/payment/create-payment-intent');
    expect(res.statusCode).toEqual(401);
  });
});