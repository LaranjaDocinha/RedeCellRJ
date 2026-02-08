import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { xssSanitizer } from '../../src/middlewares/sanitizationMiddleware.js';

// No global mocks for routes here, we want real integration!
const mocks = vi.hoisted(() => ({
  whatsappListener: vi.fn(),
  initSocketListeners: vi.fn(),
  initMarketplaceListener: vi.fn(),
  initNotificationEventListener: vi.fn(),
  marketingAutomationListener: vi.fn(),
  initCronJobs: vi.fn(),
  initWorkers: vi.fn(),
  initWhatsapp: vi.fn(),
}));

vi.mock('../../src/listeners/whatsappListener.js', () => ({ default: mocks.whatsappListener }));
vi.mock('../../src/listeners/socketEvents.js', () => ({
  initSocketListeners: mocks.initSocketListeners,
}));
vi.mock('../../src/listeners/marketplaceListener.js', () => ({
  initMarketplaceListener: mocks.initMarketplaceListener,
}));
vi.mock('../../src/listeners/notificationEventListener.js', () => ({
  initNotificationEventListener: mocks.initNotificationEventListener,
}));
vi.mock('../../src/listeners/marketingAutomationListener.js', () => ({
  default: mocks.marketingAutomationListener,
}));
vi.mock('../../src/jobs/cronJobs.js', () => ({ initCronJobs: mocks.initCronJobs }));
vi.mock('../../src/jobs/workers.js', () => ({ initWorkers: mocks.initWorkers }));
vi.mock('../../src/services/whatsappService.js', () => ({ initWhatsapp: mocks.initWhatsapp }));

// Mock Sentry properly for tests
vi.mock('@sentry/node', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    init: vi.fn(),
    Handlers: {
      requestHandler: () => (req: any, res: any, next: any) => next(),
      tracingHandler: () => (req: any, res: any, next: any) => next(),
      errorHandler: () => (err: any, req: any, res: any, next: any) => next(err),
    },
  };
});

// Import app
import { app } from '../../src/app.js';

describe('app.ts Integration', () => {
  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
  });

  it('should return "API is running" for the root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('API is running');
  });

  it('should handle JSON requests', async () => {
    const localApp = express();
    localApp.use(express.json());
    localApp.post('/json-test', (req, res) => res.json(req.body));

    const res = await request(localApp)
      .post('/json-test')
      .send({ test: 'data' })
      .set('Accept', 'application/json');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ test: 'data' });
  });

  it('should apply XSS sanitization middleware', async () => {
    const localApp = express();
    localApp.use(express.json());
    localApp.use(xssSanitizer);
    localApp.post('/xss-test', (req, res) => res.status(200).json({ body: req.body }));

    const res = await request(localApp)
      .post('/xss-test')
      .send({ malicious: '<script>alert("xss")</script>' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.body.malicious).not.toContain('<script>');
  });

  it('should handle 404 errors with the errorMiddleware', async () => {
    const res = await request(app).get('/non-existent-route-very-random');
    expect(res.statusCode).toEqual(404);
    // Standard system returns data.code
    expect(res.body.data.code).toEqual('NOT_FOUND');
    expect(res.body.status).toBe('fail');
  });

  it('should correctly set CORS headers', async () => {
    const res = await request(app).get('/').set('Origin', 'http://localhost:3001'); // An allowed origin
    expect(res.headers['access-control-allow-origin']).toEqual('http://localhost:3001');
  });

  it('should restrict CORS for non-allowed origins', async () => {
    const res = await request(app).get('/').set('Origin', 'http://malicious.com'); // A non-allowed origin
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
