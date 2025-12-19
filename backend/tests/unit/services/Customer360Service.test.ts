import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

import { Customer360Service } from '../../../src/services/Customer360Service.js';

describe('Customer360Service', () => {
  let mockQuery: any;
  let service: Customer360Service;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    vi.clearAllMocks();
    service = new Customer360Service();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCustomer360View', () => {
    it('should return null if customer not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Customer query

      const result = await service.getCustomer360View('999');
      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM customers WHERE id = $1', ['999']);
    });

    it('should return full 360 view if customer exists', async () => {
      const mockCustomer = { id: 1, name: 'John Doe' };
      const mockSales = [{ id: 101, total: 100 }];
      const mockServiceOrders = [{ id: 201, status: 'open' }];
      const mockLoyalty = [{ id: 301, points: 10 }];
      const mockComms = [{ id: 401, type: 'email' }];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 }) // Customer
        .mockResolvedValueOnce({ rows: mockSales, rowCount: 1 }) // Sales
        .mockResolvedValueOnce({ rows: mockServiceOrders, rowCount: 1 }) // Service Orders
        .mockResolvedValueOnce({ rows: mockLoyalty, rowCount: 1 }) // Loyalty
        .mockResolvedValueOnce({ rows: mockComms, rowCount: 1 }); // Comms

      const result = await service.getCustomer360View('1');

      expect(result).toEqual({
        customer: mockCustomer,
        sales: mockSales,
        serviceOrders: mockServiceOrders,
        loyaltyTransactions: mockLoyalty,
        communications: mockComms,
      });

      expect(mockQuery).toHaveBeenCalledTimes(5);
    });
  });
});
