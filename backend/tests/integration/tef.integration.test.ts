import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';
import { v4 as uuidv4 } from 'uuid';

const tefMocks = vi.hoisted(() => ({
  tefService: {
    processTefTransaction: vi.fn((data) => {
      if (data.status === 'denied') {
        throw new Error('TEF Transaction denied');
      }
      return { ...data, status: 'approved' };
    }),
    getTefTransactionStatus: vi.fn((transactionId) => {
      // Simulate different statuses for different transaction IDs
      if (transactionId === 'approved-uuid') return 'approved';
      if (transactionId === 'pending-uuid') return 'pending';
      return 'denied'; // Default for non-existent or denied
    }),
  },
}));

// Mock the tefService to prevent actual external API calls during tests
vi.mock('../../src/services/tefService.js', () => tefMocks);

import { tefService } from '../../src/services/tefService.js';

describe('TEF Integration API', () => {
  let adminToken: string;
  let server: any;

  setupTestCleanup();

  beforeAll(async () => {
    server = httpServer.listen(4001); // Start the server for tests
    const pool = getPool();
    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.token;
  });

  afterAll(async () => {
    await server.close(); // Close the server after all tests
  });

  describe('POST /api/tef/transaction', () => {
    it('should successfully process an approved TEF transaction', async () => {
      const transactionId = uuidv4();
      const transactionData = {
        transactionId,
        amount: 150.75,
        paymentMethod: 'credit_card',
        cardBrand: 'Visa',
        nsu: '123456',
        authorizationCode: 'AUTH789',
        installments: 3,
        status: 'approved',
      };

      const res = await request(app)
        .post('/api/tef/transaction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transactionData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('approved');
      expect(tefService.processTefTransaction).toHaveBeenCalledWith(transactionData);
    });

    it('should return 400 for a denied TEF transaction', async () => {
      const transactionId = uuidv4();
      const transactionData = {
        transactionId,
        amount: 50.0,
        paymentMethod: 'debit_card',
        status: 'denied',
      };

      const res = await request(app)
        .post('/api/tef/transaction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transactionData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('TEF Transaction denied');
      expect(tefService.processTefTransaction).toHaveBeenCalledWith(transactionData);
    });

    it('should return 400 for invalid transaction data (missing amount)', async () => {
      const transactionId = uuidv4();
      const transactionData = {
        transactionId,
        paymentMethod: 'credit_card',
        status: 'approved',
      };

      const res = await request(app)
        .post('/api/tef/transaction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transactionData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      const transactionId = uuidv4();
      const transactionData = {
        transactionId,
        amount: 10.0,
        paymentMethod: 'credit_card',
        status: 'approved',
      };

      const res = await request(app).post('/api/tef/transaction').send(transactionData);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/tef/status/:transactionId', () => {
    it('should return the status of an approved TEF transaction', async () => {
      const transactionId = 'approved-uuid'; // Mocked to return 'approved'
      const res = await request(app)
        .get(`/api/tef/status/${transactionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('approved');
      expect(tefService.getTefTransactionStatus).toHaveBeenCalledWith(transactionId);
    });

    it('should return the status of a pending TEF transaction', async () => {
      const transactionId = 'pending-uuid'; // Mocked to return 'pending'
      const res = await request(app)
        .get(`/api/tef/status/${transactionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('pending');
      expect(tefService.getTefTransactionStatus).toHaveBeenCalledWith(transactionId);
    });

    it('should return the status of a denied/non-existent TEF transaction', async () => {
      const transactionId = uuidv4(); // Will return 'denied' by mock
      const res = await request(app)
        .get(`/api/tef/status/${transactionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('denied');
      expect(tefService.getTefTransactionStatus).toHaveBeenCalledWith(transactionId);
    });

    it('should return 401 if not authenticated', async () => {
      const transactionId = uuidv4();
      const res = await request(app).get(`/api/tef/status/${transactionId}`);

      expect(res.statusCode).toEqual(401);
    });
  });
});
