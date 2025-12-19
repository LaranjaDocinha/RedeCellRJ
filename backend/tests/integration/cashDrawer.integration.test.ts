import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';

const cashDrawerMocks = vi.hoisted(() => ({
  cashDrawerService: {
    openCashDrawer: vi.fn(() =>
      Promise.resolve({ message: 'Cash drawer open command simulated successfully.' }),
    ),
  },
}));

// Mock the cashDrawerService to prevent actual hardware interaction during tests
vi.mock('../../src/services/cashDrawerService.js', () => cashDrawerMocks);

import { cashDrawerService } from '../../src/services/cashDrawerService.js';

describe('Cash Drawer API', () => {
  let adminToken: string;
  let server: any;


  setupTestCleanup();

  beforeAll(async () => {
    server = httpServer.listen(4003); // Start the server for tests
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

  describe('POST /api/cash-drawer/open', () => {
    it('should successfully send a command to open the cash drawer', async () => {
      const res = await request(app)
        .post('/api/cash-drawer/open')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Cash drawer open command simulated successfully.');
      expect(cashDrawerService.openCashDrawer).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/cash-drawer/open');

      expect(res.statusCode).toEqual(401);
      expect(cashDrawerService.openCashDrawer).not.toHaveBeenCalled(); // Should not be called if unauthenticated
    });
  });
});
