// frontend/src/utils/offlineApi.ts
import { db } from '../db';

interface OfflineRequest {
  url: string;
  method: string;
  headers?: HeadersInit;
  body?: any;
  timestamp: number;
  synced: number; // 0 for false, 1 for true
}

export async function sendOfflineRequest(
  url: string,
  method: string,
  data: any,
  storeName: 'offlineSales' | 'offlineServiceOrders',
  headers?: HeadersInit
): Promise<any> {
  const isOnline = navigator.onLine;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (isOnline) {
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Online request failed, storing offline:', error);
      await db[storeName].add({
        url,
        method,
        headers: requestHeaders,
        body: data,
        timestamp: Date.now(),
        synced: 0, // Use 0 for false
      });
      return Promise.resolve({ message: 'Request saved offline', offline: true });
    }
  } else {
    await db[storeName].add({
      url,
      method,
      headers: requestHeaders,
      body: data,
      timestamp: Date.now(),
      synced: 0, // Use 0 for false
    });
    return Promise.resolve({ message: 'Request saved offline', offline: true });
  }
}

export async function syncOfflineRequests(storeName: 'offlineSales' | 'offlineServiceOrders') {
  const offlineRequests = await db[storeName].where('synced').equals(0).toArray(); // Query for 0

  for (const request of offlineRequests) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(request.body),
      });

      if (response.ok) {
        await db[storeName].delete(request.id!); // Remove after success
        console.log(`Offline request synced successfully and removed: ${request.url}`);
      } else {
        console.error(`Failed to sync offline request ${request.url}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error syncing offline request ${request.url}:`, error);
    }
  }
}

window.addEventListener('online', () => {
  console.log('Browser is online, attempting to sync offline requests...');
  syncOfflineRequests('offlineSales');
  syncOfflineRequests('offlineServiceOrders');
});
