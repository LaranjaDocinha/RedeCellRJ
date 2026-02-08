import { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';
import * as ofx from 'ofx-parser';

export const reconciliationService = {
  /**
   * Processa um arquivo OFX e sugere conciliações.
   */
  async processOfx(ofxContent: string) {
    try {
      const data = ofx.parse(ofxContent);
      const transactions = data.OFX.BANKMSGSRSV1.STTRNRSV1.STMTRS.BANKTRANLIST.STTRN;

      const results = [];
      for (const trans of transactions) {
        const amount = parseFloat(trans.TRNAMT);
        const date = this._parseOfxDate(trans.DTPOSTED);
        const fitId = trans.FITID;
        const memo = trans.NAME || trans.MEMO || '';

        // Tenta encontrar um "Match" provável no sistema (Venda ou Despesa)
        const match = await this._findProbableMatch(amount, date);

        results.push({
          bankTransaction: {
            id: fitId,
            amount,
            date,
            description: memo,
          },
          suggestedMatch: match,
        });
      }

      return results;
    } catch (error) {
      logger.error('Error parsing OFX', error);
      throw error;
    }
  },

  _parseOfxDate(ofxDate: string): Date {
    // Formato: YYYYMMDDHHMMSS
    const year = parseInt(ofxDate.substring(0, 4));
    const month = parseInt(ofxDate.substring(4, 6)) - 1;
    const day = parseInt(ofxDate.substring(6, 8));
    return new Date(year, month, day);
  },

  async _findProbableMatch(amount: number, date: Date) {
    // Busca vendas com valor idêntico e data próxima (+- 3 dias)
    const { rows } = await getPool().query(
      `SELECT id, total_amount as amount, sale_date as date, 'sale' as type 
       FROM sales 
       WHERE total_amount = $1 
       AND sale_date BETWEEN $2::timestamp - interval '3 days' AND $2::timestamp + interval '3 days'
       LIMIT 1`,
      [Math.abs(amount), date],
    );

    return rows[0] || null;
  },
};
