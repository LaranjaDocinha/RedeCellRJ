import fs from 'fs';
import { parse } from 'ofx-parser';
import { AppError } from './errors.js';

export interface OfxTransaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  type: 'DEBIT' | 'CREDIT';
}

export const ofxParser = {
  async parseFile(filePath: string): Promise<OfxTransaction[]> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = await parse(fileContent);

      const transactions = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;

      // Ensure transactions is an array (might be object if single transaction)
      const txnArray = Array.isArray(transactions) ? transactions : [transactions];

      return txnArray.map((t: any) => ({
        id: t.FITID,
        date: new Date(
          t.DTPOSTED.slice(0, 4) + '-' + t.DTPOSTED.slice(4, 6) + '-' + t.DTPOSTED.slice(6, 8),
        ),
        amount: parseFloat(t.TRNAMT),
        description: t.MEMO,
        type: t.TRNTYPE === 'CREDIT' ? 'CREDIT' : 'DEBIT',
      }));
    } catch (_error) {
      throw new AppError('Falha ao processar arquivo OFX. Verifique o formato.', 400);
    }
  },
};
