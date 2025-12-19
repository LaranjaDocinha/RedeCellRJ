import request from 'supertest';
import nock from 'nock';
import { app } from '../../src/app.js';
import { getAdminAuthToken } from '../utils/auth.js';

const REPORTS_MICROSERVICE_URL = 'http://localhost:5001';

describe('P&L Report API', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAdminAuthToken();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return a P&L report by calling the microservice', async () => {
    const mockPnlData = {
      totalRevenue: 200.0,
      totalCogs: 100.0,
      grossProfit: 100.0,
      totalExpenses: 50.0,
      netProfit: 50.0,
    };

    // Mock the reports microservice
    nock(REPORTS_MICROSERVICE_URL)
      .get('/api/pnl-report')
      .query({ startDate: '2025-10-01', endDate: '2025-11-30' })
      .reply(200, mockPnlData);

    const response = await request(app)
      .get('/api/pnl-report')
      .set('Authorization', `Bearer ${token}`)
      .query({ startDate: '2025-10-01', endDate: '2025-11-30' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPnlData);
  });

  it('should handle errors from the microservice', async () => {
    // Mock the reports microservice returning an error
    nock(REPORTS_MICROSERVICE_URL)
      .get('/api/pnl-report')
      .query({ startDate: '2025-10-01', endDate: '2025-11-30' })
      .reply(500, { message: 'Internal Server Error from microservice' });

    const response = await request(app)
      .get('/api/pnl-report')
      .set('Authorization', `Bearer ${token}`)
      .query({ startDate: '2025-10-01', endDate: '2025-11-30' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal Server Error from microservice' });
  });
});
