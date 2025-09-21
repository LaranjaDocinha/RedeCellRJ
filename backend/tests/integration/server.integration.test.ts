import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import httpServer from '../../src/index.js'; // Import the HTTP server
import testPool from '../../src/db'; // Import the test pool to close it after tests

// Mock necessary middlewares and modules to isolate server startup
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  authMiddleware: {
    authenticate: (req: any, res: any, next: any) => next(),
    authorize: (roles: any) => (req: any, res: any, next: any) => next(),
  },
}));

vi.mock('../../src/middlewares/errorMiddleware.js', () => ({
  default: (err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500).send(err.message || 'Internal Server Error');
  },
}));

vi.mock('csurf', () => ({
  default: () => (req: any, res: any, next: any) => {
    req.csrfToken = () => 'mock_csrf_token';
    next();
  },
}));

// Mock Sentry to prevent actual Sentry calls during tests
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

describe('Server Startup and Basic Routes - Integration', () => {
  let server: any;

  beforeAll(async () => {
    // Set NODE_ENV to 'test' to prevent Sentry from initializing fully
    process.env.NODE_ENV = 'test';
    server = httpServer.listen(0); // Listen on a random available port
  });

  afterAll(async () => {
    await server.close();
    await testPool.end(); // Close the database pool connection
  });

  it('should respond to the root route with a success message', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Backend do Gerenciador de Loja de Celular está funcionando!');
  });

  it('should respond to the test-route with a success message', async () => {
    const res = await request(server).get('/test-route');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Test route works!');
  });

  it('should return a CSRF token', async () => {
    const res = await request(server).get('/csrf-token');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('csrfToken');
    expect(res.body.csrfToken).toEqual('mock_csrf_token');
  });
});
