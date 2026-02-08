import { describe, it, expect, vi } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    connect: mockConnect,
    query: mockQuery,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

import * as mobileAppService from '../../../src/services/mobileAppService.js';

describe('mobileAppService', () => {
  it('getOfflineData should return simulated data', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await mobileAppService.getOfflineData('user-1');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Offline data fetched (simulated).');
    expect(result.data).toEqual({ products: [], customers: [], serviceOrders: [] });
    expect(consoleSpy).toHaveBeenCalledWith('Simulating fetching offline data for user user-1');
    consoleSpy.mockRestore();
  });

  it('syncMobileData should return simulated success', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await mobileAppService.syncMobileData({ some: 'data' });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Mobile data synchronized (simulated).');
    expect(consoleSpy).toHaveBeenCalledWith('Simulating mobile data synchronization:', {
      some: 'data',
    });
    consoleSpy.mockRestore();
  });

  it('getMobileAppStatus should return simulated status', async () => {
    const result = await mobileAppService.getMobileAppStatus();

    expect(result.status).toBe('Online');
    expect(result.appVersion).toBe('1.0.0');
    expect(result.lastSync).toBeDefined();
  });
});
