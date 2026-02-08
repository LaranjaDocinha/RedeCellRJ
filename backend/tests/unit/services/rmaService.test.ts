import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rmaService } from '../../../src/services/rmaService.js';
import pool from '../../../src/db/index.js';

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    autoTable: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnValue(new ArrayBuffer(8)),
    lastAutoTable: { cursor: { y: 100 } }
  })),
}));

const mocks = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
  };
  return { mockClient, mockPool };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
}));

describe('RmaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mocks.mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('createRmaRequest', () => {
    it('should create RMA and items in transaction', async () => {
      mocks.mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT rma
        .mockResolvedValueOnce({}) // INSERT item
        .mockResolvedValueOnce({}) // UPDATE stock
        .mockResolvedValueOnce({}); // COMMIT

      const items = [{ variation_id: 10, quantity: 2, cost_price: 50, reason: 'defective' }];
      const result = await rmaService.createRmaRequest(1, items, 'Notes');

      expect(result.id).toBe(1);
      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mocks.mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO rma_requests'), [1, 100, 'Notes']);
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      mocks.mockClient.query.mockResolvedValueOnce({}); // BEGIN
      mocks.mockClient.query.mockRejectedValueOnce(new Error('Fail'));

      await expect(rmaService.createRmaRequest(1, [], 'notes')).rejects.toThrow();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('generateBorderou', () => {
    it('should generate PDF arraybuffer', async () => {
      mocks.mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 1, supplier_name: 'S1', total_amount: 100, created_at: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ sku: 'SKU1', product_name: 'P1', quantity: 1, reason: 'R', cost_price: 100 }] });

      const result = await rmaService.generateBorderou(1);
      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });
});
