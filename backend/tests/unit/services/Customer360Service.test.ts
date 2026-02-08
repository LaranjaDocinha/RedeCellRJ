import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPool, mockConnect, mockClient, mockClientQuery } = vi.hoisted(() => {
  const mClientQuery = vi.fn();
  const mRelease = vi.fn();
  const mClient = { query: mClientQuery, release: mRelease };
  const mConnect = vi.fn().mockResolvedValue(mClient);
  const mPool = { connect: mConnect, query: vi.fn() };
  return {
    mockPool: mPool,
    mockConnect: mConnect,
    mockClient: mClient,
    mockClientQuery: mClientQuery,
  };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mockPool,
  getPool: () => mockPool,
}));

import { customer360Service } from '../../../src/services/Customer360Service.js';

describe('Customer360Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('getTimeline', () => {
    it('should return sorted timeline events from all sources', async () => {
      mockClientQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, sale_date: '2023-01-01', total_amount: 100 }] }) // Sales
        .mockResolvedValueOnce({ rows: [{ id: 10, created_at: '2023-01-02', product_description: 'OS1', status: 'OK' }] }) // OS
        .mockResolvedValueOnce({ rows: [{ name: 'John' }] }) // Customer check for prints
        .mockResolvedValueOnce({ rows: [{ id: 100, created_at: '2023-01-03', description: 'Print1', quantity: 5 }] }); // Prints

      const timeline = await customer360Service.getTimeline(1);

      expect(timeline).toHaveLength(3);
      // Sorted by date desc
      expect(timeline[0].type).toBe('print');
      expect(timeline[1].type).toBe('os');
      expect(timeline[2].type).toBe('sale');
    });

    it('should handle missing customer when fetching prints', async () => {
      mockClientQuery
        .mockResolvedValueOnce({ rows: [] }) // Sales
        .mockResolvedValueOnce({ rows: [] }) // OS
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Customer check fails

      const timeline = await customer360Service.getTimeline(1);
      expect(timeline).toHaveLength(0);
    });
  });

  describe('getCustomer360View', () => {
    it('should return null if customer not found', async () => {
      mockClientQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await customer360Service.getCustomer360View(999);
      expect(res).toBeNull();
    });

    it('should return full 360 view if customer exists', async () => {
      mockClientQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test', loyalty_points: 50 }] }) // View check
        .mockResolvedValueOnce({ rows: [] }) // Timeline Sales
        .mockResolvedValueOnce({ rows: [] }) // Timeline OS
        .mockResolvedValueOnce({ rows: [{ name: 'Test' }] }) // Timeline Customer Check
        .mockResolvedValueOnce({ rows: [] }); // Timeline Prints

      const res = await customer360Service.getCustomer360View(1);

      expect(res).toBeDefined();
      expect(res?.profile.name).toBe('Test');
      expect(res?.loyalty.points).toBe(50);
      expect(res?.timeline).toBeInstanceOf(Array);
    });
  });
});
