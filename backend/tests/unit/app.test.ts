import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock specific parts of the app to avoid starting real servers or DB connections during unit/integration-like testing of app.ts
// Fix paths: from backend/tests/unit/app.test.ts to backend/src is ../../src
vi.mock('../../src/listeners/marketingAutomationListener.js', () => ({ default: vi.fn() }));
vi.mock('../../src/listeners/whatsappListener.js', () => ({ default: vi.fn() }));
vi.mock('../../src/listeners/socketEvents.js', () => ({ initSocketListeners: vi.fn() }));
vi.mock('../../src/listeners/marketplaceListener.js', () => ({ initMarketplaceListener: vi.fn() }));
vi.mock('../../src/listeners/notificationEventListener.js', () => ({
  initNotificationEventListener: vi.fn(),
}));
vi.mock('../../src/listeners/systemNotificationListener.js', () => ({
  initSystemNotificationListener: vi.fn(),
}));
vi.mock('../../src/jobs/cronJobs.js', () => ({ initCronJobs: vi.fn() }));
vi.mock('../../src/jobs/workers.js', () => ({ initWorkers: vi.fn() }));
vi.mock('../../src/services/whatsappService.js', () => ({ initWhatsapp: vi.fn() }));

import { app } from '../../src/app.js';

describe('App', () => {
  it('should have health check route', async () => {
    const res = await request(app).get('/');
    if (res.status === 500) console.log('DEBUG 500 Health:', JSON.stringify(res.body, null, 2));
    expect(res.status).toBe(200);
    expect(res.text).toBe('API is running');
  });

  it('should handle 404', async () => {
    const res = await request(app).get('/random-route-not-found');
    if (res.status === 500) console.log('DEBUG 500 404:', JSON.stringify(res.body, null, 2));
    expect(res.status).toBe(404);
  });
});
