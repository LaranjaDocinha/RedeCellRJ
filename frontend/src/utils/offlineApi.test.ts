import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendOfflineRequest, syncOfflineRequests } from './offlineApi';
import { db } from '../db';

vi.mock('../db', () => ({
  db: {
    offlineSales: {
      add: vi.fn().mockResolvedValue(1),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined)
    },
    offlineServiceOrders: {
      add: vi.fn().mockResolvedValue(1),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined)
    }
  }
}));

describe('Offline API Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('navigator', { onLine: true });
  });

  it('should call fetch immediately if online', async () => {
    const mockResponse = { success: true };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await sendOfflineRequest('/api/sale', 'POST', { total: 100 }, 'offlineSales');

    expect(fetch).toHaveBeenCalledWith('/api/sale', expect.objectContaining({ method: 'POST' }));
    expect(result).toEqual(mockResponse);
    expect(db.offlineSales.add).not.toHaveBeenCalled();
  });

  it('should store in DB if offline', async () => {
    vi.stubGlobal('navigator', { onLine: false });

    const result = await sendOfflineRequest('/api/sale', 'POST', { total: 100 }, 'offlineSales');

    expect(fetch).not.toHaveBeenCalled();
    expect(db.offlineSales.add).toHaveBeenCalled();
    expect(result.offline).toBe(true);
  });

  it('should store in DB if fetch fails while online', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    const result = await sendOfflineRequest('/api/sale', 'POST', { total: 100 }, 'offlineSales');

    expect(db.offlineSales.add).toHaveBeenCalled();
    expect(result.offline).toBe(true);
  });

  it('should sync offline requests and delete them on success', async () => {
    const mockRequests = [{ id: 1, url: '/api/sync', method: 'POST', body: {} }];
    (db.offlineSales.toArray as any).mockResolvedValue(mockRequests);
    (fetch as any).mockResolvedValue({ ok: true });

    await syncOfflineRequests('offlineSales');

    expect(fetch).toHaveBeenCalledWith('/api/sync', expect.any(Object));
    expect(db.offlineSales.delete).toHaveBeenCalledWith(1);
  });
});