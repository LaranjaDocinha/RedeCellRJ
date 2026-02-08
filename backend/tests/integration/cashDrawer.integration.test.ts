import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { cashDrawerService } from '../../src/services/cashDrawerService.js';

describe('Cash Drawer API', () => {
  let adminToken: string;
  let server: any;

  beforeAll(async () => {
    server = httpServer.listen(0);
    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.accessToken;
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/cash-drawer/open', () => {
    it('should successfully send a command to open the cash drawer', async () => {
      const spy = vi.spyOn(cashDrawerService, 'openCashDrawer').mockResolvedValue({
        message: 'Cash drawer open command simulated successfully.',
      });

      const res = await request(app)
        .post('/api/cash-drawer/open')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Cash drawer open command simulated successfully.');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('should return 401 if not authenticated', async () => {
      const spy = vi.spyOn(cashDrawerService, 'openCashDrawer');
      const res = await request(app).post('/api/cash-drawer/open');

      expect(res.statusCode).toEqual(401);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
