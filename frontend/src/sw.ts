import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { db } from './db';

declare const self: ServiceWorkerGlobalScope;

// Precache all assets injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST);

// Cleanup outdated caches
cleanupOutdatedCaches();

// --- Background Sync for Sales ---
const salesSyncPlugin = new BackgroundSyncPlugin('sync-sales', {
  maxRetentionTime: 24 * 60, // Retry for max 24 Hours
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone());
        console.log('Sale synced successfully!', response);
      } catch (error) {
        console.error('Failed to sync sale:', error);
        // Re-add the request to the queue for a future sync attempt
        await queue.unshiftRequest(entry);
        // You might want to throw an error to stop the sync process
        // if a certain number of retries have been attempted.
        throw new Error('Sale sync failed, will retry later.');
      }
    }
  },
});

// --- Background Sync for Service Orders ---
const serviceOrdersSyncPlugin = new BackgroundSyncPlugin('sync-service-orders', {
  maxRetentionTime: 24 * 60, // Retry for max 24 Hours
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone());
        console.log('Service Order synced successfully!', response);
      } catch (error) {
        console.error('Failed to sync service order:', error);
        await queue.unshiftRequest(entry);
        throw new Error('Service Order sync failed, will retry later.');
      }
    }
  },
});

// Register routes for offline functionality
registerRoute(
  ({ url }) => url.pathname === '/api/sales',
  new NetworkOnly({
    plugins: [salesSyncPlugin],
  }),
  'POST'
);

registerRoute(
  ({ url }) => url.pathname === '/api/service-orders',
  new NetworkOnly({
    plugins: [serviceOrdersSyncPlugin],
  }),
  'POST'
);

// A simple example of a cache-first strategy for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache GET requests to API endpoints using NetworkFirst strategy
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-get-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, // Cache up to 50 API responses
        maxAgeSeconds: 5 * 60, // Cache for 5 minutes
      }),
    ],
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
