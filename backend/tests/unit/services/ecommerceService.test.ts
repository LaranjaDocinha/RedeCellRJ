import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  syncProductToShopify,
  pullOrdersFromShopify,
} from '../../../src/services/ecommerceService';
import * as shopifyApiModule from '@shopify/shopify-api';

// Mock Fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mocks para o módulo @shopify/shopify-api com vi.hoisted
const { mockShopifyApi, mockShopifyApiInstance } = vi.hoisted(() => {
  const instance = vi.fn();
  const factory = vi.fn(() => instance);
  return {
    mockShopifyApiInstance: instance,
    mockShopifyApi: factory,
  };
});

vi.mock('@shopify/shopify-api', async (importActual) => {
  const actual = await importActual<typeof shopifyApiModule>();
  return {
    ...actual,
    shopifyApi: mockShopifyApi, // Retorna a factory function mockada
    ApiVersion: { October23: 'October23' }, // Mantém o enum
  };
});

vi.mock('@shopify/shopify-api/rest/admin/2023-10'); // Mockar restResources

describe('EcommerceService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todas as chamadas e mocks

    mockFetch.mockReset(); // Reseta o mock de fetch
    mockShopifyApi.mockClear(); // Reseta o mock da factory shopifyApi
    mockShopifyApiInstance.mockClear(); // Reseta o mock da instância retornada

    // Default mocks
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura tudo
  });

  describe('syncProductToShopify', () => {
    it('should simulate product sync', async () => {
      const result = await syncProductToShopify(123);
      expect(result.success).toBe(true);
      expect(result.shopifyId).toContain('123');
    });
  });

  describe('pullOrdersFromShopify', () => {
    it('should simulate pulling orders', async () => {
      const result = await pullOrdersFromShopify();
      expect(result.success).toBe(true);
      expect(result.newOrders).toBe(1);
    });
  });
});
