import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { v4 as uuidv4 } from 'uuid';
import { tefService } from '../../src/services/tefService.js';
import { AppError } from '../../src/utils/errors.js';
import { getAdminAuthToken } from '../utils/auth.js';

describe('TEF Integration API', () => {
  let adminToken: string;

  beforeEach(async () => {
    adminToken = await getAdminAuthToken();
    vi.spyOn(tefService, 'processTefTransaction').mockImplementation((data: any) => {
      if (data.status === 'denied') {
        return Promise.reject(new AppError('TEF Transaction denied', 400));
      }
      return Promise.resolve({
        status: 'approved',
        transactionId: data.transactionId || 'dummy_tef_id',
        nsu: '123456',
        authorizationCode: 'AUTH123',
        message: 'Transaction Approved',
      });
    });

    vi.spyOn(tefService, 'getTefTransactionStatus').mockImplementation((id: string) => {
      if (id === 'approved-uuid') return Promise.resolve('approved' as any);
      if (id === 'pending-uuid') return Promise.resolve('pending' as any);
      return Promise.resolve('denied' as any);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/tef/transaction', () => {
    it('should successfully process an approved TEF transaction', async () => {
      const transactionData = {
        transactionId: uuidv4(),
        amount: 150.75,
        paymentMethod: 'credit_card',
        status: 'approved',
      };

      const res = await request(app)
        .post('/api/tef/transaction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transactionData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toEqual('approved');
    });

    it('should return 400 for a denied TEF transaction', async () => {
      const transactionData = {
        transactionId: uuidv4(),
        amount: 50.0,
        paymentMethod: 'debit_card',
        status: 'denied',
      };

      const res = await request(app)
        .post('/api/tef/transaction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transactionData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.data.message).toMatch(/denied/i);
    });
  });

  describe('GET /api/tef/status/:transactionId', () => {
    it('should return the status of an approved TEF transaction', async () => {
      const res = await request(app)
        .get('/api/tef/status/approved-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toEqual('approved');
    });
  });
});
