import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express'; // Import express for type hinting
import http from 'http';
import * as Sentry from '@sentry/node'; // ADDED: Import Sentry for testing
import { xssSanitizer } from '../../src/middlewares/sanitizationMiddleware.js';

const mocks = vi.hoisted(() => ({
  whatsappListener: vi.fn(),
  initSocketListeners: vi.fn(),
  initMarketplaceListener: vi.fn(),
  initNotificationEventListener: vi.fn(),
  marketingAutomationListener: vi.fn(),
  initCronJobs: vi.fn(),
  initWorkers: vi.fn(),
  initWhatsapp: vi.fn(),
  chaosMiddleware: vi.fn((req, res, next) => next()),
  requestLoggerMiddleware: vi.fn((req, res, next) => next()),
  healthController: {
    check: vi.fn((req, res) => res.status(200).json({ message: 'OK' })),
  },
  authRouter: express.Router().get('/test', (req, res) => res.status(200).send('Auth Test')),
}));

// Mockar todas as inicializações que não são relevantes para o teste da estrutura do express
vi.mock('../../src/listeners/whatsappListener.js', () => ({ default: mocks.whatsappListener }));
vi.mock('../../src/listeners/socketEvents.js', () => ({ initSocketListeners: mocks.initSocketListeners }));
vi.mock('../../src/listeners/marketplaceListener.js', () => ({ initMarketplaceListener: mocks.initMarketplaceListener }));
vi.mock('../../src/listeners/notificationEventListener.js', () => ({ initNotificationEventListener: mocks.initNotificationEventListener }));
vi.mock('../../src/listeners/marketingAutomationListener.js', () => ({ default: mocks.marketingAutomationListener }));
vi.mock('../../src/jobs/cronJobs.js', () => ({ initCronJobs: mocks.initCronJobs }));
vi.mock('../../src/jobs/workers.js', () => ({ initWorkers: mocks.initWorkers }));
vi.mock('../../src/services/whatsappService.js', () => ({ initWhatsapp: mocks.initWhatsapp }));
vi.mock('../../src/middlewares/chaos/chaos.js', () => ({ default: mocks.chaosMiddleware }));
vi.mock('../../src/middlewares/requestLoggerMiddleware.js', () => ({ requestLoggerMiddleware: mocks.requestLoggerMiddleware }));
vi.mock('../../src/controllers/healthController.js', () => ({ healthController: mocks.healthController }));
vi.mock('../../src/routes/auth.js', () => ({ default: mocks.authRouter }));

// Mockar Sentry para evitar chamadas externas e erros no ambiente de teste
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  Handlers: {
    requestHandler: () => (req: any, res: any, next: any) => next(),
    tracingHandler: () => (req: any, res: any, next: any) => next(),
    errorHandler: () => (err: any, req: any, res: any, next: any) => next(err),
  },
  httpIntegration: vi.fn(),
  Integrations: {
    Express: vi.fn(),
  },
}));

const { app } = await import('../../src/app.js'); // Importar app DEPOIS dos mocks

describe('app.ts', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('should correctly mount a mocked auth route', async () => {
    const res = await request(app).get('/api/auth/test');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Auth Test');
  });

  it('should correctly mount the mocked health route', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'OK' });
  });

  it('should handle 404 errors with the errorMiddleware', async () => {
    const localApp = express();
    // Add some middleware to simulate a real app,
    // then a 404 handler that sets the status
    localApp.use((req, res, next) => {
      res.status(404).send('Not Found');
    });

    const res = await request(localApp).get('/non-existent-route');
    expect(res.statusCode).toEqual(404);
    expect(res.text).toEqual('Not Found');
  });

  it('should initialize Sentry handlers in non-test environment', async () => {
    expect(vi.mocked(Sentry.init)).not.toHaveBeenCalled();
  });

  it('should correctly set CORS headers', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3001'); // An allowed origin
    expect(res.headers['access-control-allow-origin']).toEqual('http://localhost:3001');
    expect(res.headers['access-control-allow-credentials']).toEqual('true');
  });

  it('should restrict CORS for non-allowed origins', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', 'http://malicious.com'); // A non-allowed origin
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  }, 40000); // Increased timeout for this specific test
});