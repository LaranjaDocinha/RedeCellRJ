import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock specific parts of the app to avoid starting real servers or DB connections during unit/integration-like testing of app.ts
vi.mock('../../../src/listeners/marketingAutomationListener.js', () => ({ default: vi.fn() }));
vi.mock('../../../src/listeners/whatsappListener.js', () => ({ default: vi.fn() }));
vi.mock('../../../src/listeners/socketEvents.js', () => ({ initSocketListeners: vi.fn() }));
vi.mock('../../../src/listeners/marketplaceListener.js', () => ({ initMarketplaceListener: vi.fn() }));
vi.mock('../../../src/listeners/notificationEventListener.js', () => ({ initNotificationEventListener: vi.fn() }));
vi.mock('../../../src/jobs/cronJobs.js', () => ({ initCronJobs: vi.fn() }));
vi.mock('../../../src/jobs/workers.js', () => ({ initWorkers: vi.fn() }));
vi.mock('../../../src/services/whatsappService.js', () => ({ initWhatsapp: vi.fn() }));

// We need to import app dynamically or make sure mocks are set before import
// But we can just import it now since mocks are hoisted by vitest (usually)
// However, since app.ts has top-level execution, it's safer to rely on the mocks.

import { app } from '../../src/app.js';

describe('App', () => {
  it('should have health check route', async () => {
    // This is basically an integration test but running in the unit suite for coverage
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('API is running');
  });

  it('should handle 404', async () => {
    const res = await request(app).get('/random-route-not-found');
    expect(res.status).toBe(404);
  });
});
