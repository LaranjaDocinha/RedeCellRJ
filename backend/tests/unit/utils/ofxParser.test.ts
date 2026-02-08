import { describe, it, expect, vi } from 'vitest';
import { ofxParser } from '../../../src/utils/ofxParser.js';
import fs from 'fs';
import { parse } from 'ofx-parser';

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock('ofx-parser', () => ({
  parse: vi.fn(),
}));

describe('OFX Parser Utility', () => {
  it('should parse valid OFX file with multiple transactions', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue('<OFX>...</OFX>');
    const mockData = {
      OFX: {
        BANKMSGSRSV1: {
          STMTTRNRS: {
            STMTRS: {
              BANKTRANLIST: {
                STMTTRN: [
                  { FITID: '1', DTPOSTED: '20230101', TRNAMT: '-50.00', MEMO: 'Test 1', TRNTYPE: 'DEBIT' },
                  { FITID: '2', DTPOSTED: '20230102', TRNAMT: '100.00', MEMO: 'Test 2', TRNTYPE: 'CREDIT' }
                ]
              }
            }
          }
        }
      }
    };
    vi.mocked(parse).mockResolvedValue(mockData);

    const result = await ofxParser.parseFile('test.ofx');

    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(-50);
    expect(result[1].type).toBe('CREDIT');
  });

  it('should handle single transaction object', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue('<OFX>...</OFX>');
    const mockData = {
      OFX: {
        BANKMSGSRSV1: {
          STMTTRNRS: {
            STMTRS: {
              BANKTRANLIST: {
                STMTTRN: { FITID: '1', DTPOSTED: '20230101', TRNAMT: '10', MEMO: 'M', TRNTYPE: 'C' }
              }
            }
          }
        }
      }
    };
    vi.mocked(parse).mockResolvedValue(mockData);

    const result = await ofxParser.parseFile('test.ofx');
    expect(result).toHaveLength(1);
  });

  it('should throw AppError on failure', async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('FS Fail'); });
    await expect(ofxParser.parseFile('err.ofx')).rejects.toThrow(/Falha ao processar arquivo/);
  });
});
