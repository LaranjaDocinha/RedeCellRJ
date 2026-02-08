import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  syncProductsToEcommerce,
  syncOrdersFromEcommerce,
  getEcommerceSyncStatus,
} from '../../../src/services/ecommerceSyncService.js';

describe('ecommerceSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todos os mocks antes de cada teste
  });

  describe('syncProductsToEcommerce', () => {
    it('should return success and a message indicating simulated product sync', async () => {
      const productsData = [{ id: 1, name: 'Test Product' }];
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log

      const result = await syncProductsToEcommerce(productsData);

      expect(result).toEqual({
        success: true,
        message: 'Product data sent to e-commerce (simulated).',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Simulating product synchronization to e-commerce platform:',
        productsData,
      );
      consoleSpy.mockRestore(); // Restaura console.log
    });
  });

  describe('syncOrdersFromEcommerce', () => {
    it('should return success and a message indicating simulated order fetch', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log

      const result = await syncOrdersFromEcommerce();

      expect(result).toEqual({
        success: true,
        message: 'Orders fetched from e-commerce (simulated).',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Simulating fetching orders from e-commerce platform.',
      );
      consoleSpy.mockRestore(); // Restaura console.log
    });
  });

  describe('getEcommerceSyncStatus', () => {
    it('should return a simulated e-commerce sync status object', async () => {
      const result = await getEcommerceSyncStatus();

      expect(result).toHaveProperty('status', 'Connected');
      expect(result).toHaveProperty('platform', 'Shopify (Simulated)');
      expect(result).toHaveProperty('lastSync');
      // Verifica se lastSync é uma string ISO válida (formato "YYYY-MM-DDTHH:mm:ss.sssZ")
      expect(typeof result.lastSync).toBe('string');
      expect(() => new Date(result.lastSync)).not.toThrow(); // Garante que é uma data válida
    });
  });
});
