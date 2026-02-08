import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reconciliationService } from '../../../src/services/reconciliationService.js';
import * as ofx from 'ofx-parser';
import pool from '../../../src/db/index.js';

vi.mock('ofx-parser', () => ({
  parse: vi.fn(),
}));

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

vi.mock('../../../src/db/index.js', () => ({
  default: { query: mockQuery },
  getPool: () => ({ query: mockQuery }),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { error: vi.fn() },
}));

describe('ReconciliationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processOfx', () => {
    it('should parse OFX and suggest matches', async () => {
      const mockOfxData = {
        OFX: {
          BANKMSGSRSV1: {
            STTRNRSV1: {
              STMTRS: {
                BANKTRANLIST: {
                  STTRN: [
                    { TRNAMT: '-100.00', DTPOSTED: '20230101120000', FITID: '123', NAME: 'Test' }
                  ]
                }
              }
            }
          }
        }
      };
      vi.mocked(ofx.parse).mockReturnValue(mockOfxData);
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, amount: 100, type: 'sale' }] });

      const result = await reconciliationService.processOfx('<OFX>...</OFX>');

      expect(result).toHaveLength(1);
      expect(result[0].suggestedMatch.id).toBe(1);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id, total_amount'), [100, expect.any(Date)]);
    });

    it('should handle errors during parsing', async () => {
      vi.mocked(ofx.parse).mockImplementation(() => { throw new Error('Parse error'); });
      await expect(reconciliationService.processOfx('bad ofx')).rejects.toThrow('Parse error');
    });
  });

  describe('_parseOfxDate', () => {
    it('should parse YYYYMMDD string correctly', () => {
      const date = (reconciliationService as any)._parseOfxDate('20230515120000');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(4); // May
      expect(date.getDate()).toBe(15);
    });
  });
});
