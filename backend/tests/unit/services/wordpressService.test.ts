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

import * as wordpressService from '../../../src/services/wordpressService.js';

describe('wordpressService', () => {
  it('syncProductsToWordPress should return simulated success', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await wordpressService.syncProductsToWordPress([{ id: 1, name: 'Product' }]);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Product data sent to WordPress/WooCommerce (simulated).');
    expect(consoleSpy).toHaveBeenCalledWith('Simulating product synchronization to WordPress/WooCommerce:', [{ id: 1, name: 'Product' }]);
    consoleSpy.mockRestore();
  });

  it('syncOrdersFromWordPress should return simulated success', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await wordpressService.syncOrdersFromWordPress();
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Orders fetched from WordPress/WooCommerce (simulated).');
    expect(consoleSpy).toHaveBeenCalledWith('Simulating fetching orders from WordPress/WooCommerce.');
    consoleSpy.mockRestore();
  });

  it('getWordPressStatus should return simulated status', async () => {
    const result = await wordpressService.getWordPressStatus();
    
    expect(result.status).toBe('Connected');
    expect(result.platform).toBe('WordPress/WooCommerce (Simulated)');
    expect(result.lastCheck).toBeDefined();
  });
});
