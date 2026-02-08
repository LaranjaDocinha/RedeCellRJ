import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printService } from '../../../src/services/printService.js';
import { whatsappService } from '../../../src/services/whatsappService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('../../../src/services/whatsappService.js', () => ({
  whatsappService: {
    queueTemplateMessage: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('PrintService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCost', () => {
    it('should calculate cost and price correctly', () => {
      const res = printService.calculateCost(10, { costPerPage: 0.1, inkCostPerPage: 0.1, markup: 2 });
      // totalCost = 10 * (0.1 + 0.1) = 2.0
      // suggestedPrice = 2.0 * 2 = 4.0
      expect(Number(res.totalCost)).toBe(2.0);
      expect(Number(res.suggestedPrice)).toBe(4.0);
      expect(Number(res.profit)).toBe(2.0);
    });
  });

  describe('createJob', () => {
    it('should insert job into db', async () => {
      const mockJob = { id: 1, customer_name: 'John' };
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockJob] } as any);

      const result = await printService.createJob({ customer_name: 'John', description: 'Docs', quantity: 5 });

      expect(result).toEqual(mockJob);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO print_jobs'), expect.any(Array));
    });
  });

  describe('listJobs', () => {
    it('should list non-delivered jobs', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);
      await printService.listJobs();
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('status != $1'), ['Entregue']);
    });
  });

  describe('updateJobStatus', () => {
    it('should update status in db', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: 1, status: 'Pronto' }] } as any);
      const res = await printService.updateJobStatus(1, 'Pronto');
      expect(res.status).toBe('Pronto');
    });
  });

  describe('notifyCustomer', () => {
    it('should queue whatsapp message if job exists with phone', async () => {
      const mockJob = { id: 1, customer_name: 'John', customer_phone: '123' };
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockJob] } as any);

      const result = await printService.notifyCustomer(1);

      expect(result.success).toBe(true);
      expect(whatsappService.queueTemplateMessage).toHaveBeenCalledWith(expect.objectContaining({
        phone: '123',
        templateName: 'print_ready'
      }));
    });

    it('should throw error if job not found or no phone', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);
      await expect(printService.notifyCustomer(1)).rejects.toThrow(/não encontrado/);
    });
  });
});
