import { parse } from 'ofx-parser';
import { getPool } from '../db/index.js';
export const processOfxFile = async (ofxContent) => {
    const pool = getPool();
    let importedCount = 0;
    let skippedCount = 0;
    try {
        const data = parse(ofxContent);
        // Basic structure traversal: OFX -> BANKMSGSRSV1 -> STMTTRNRS -> STMTRS -> BANKTRANLIST -> STMTTRN
        // This might vary based on bank. Assuming standard structure.
        const bankMsgs = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
        const transactions = Array.isArray(bankMsgs) ? bankMsgs : [bankMsgs];
        for (const txn of transactions) {
            const fitid = txn.FITID;
            const amount = parseFloat(txn.TRNAMT);
            const memo = txn.MEMO || txn.NAME || 'No description';
            // Date parsing might be needed depending on format YYYYMMDD...
            const dateStr = txn.DTPOSTED.substring(0, 8);
            const date = new Date(`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`);
            // Check if transaction exists
            const exists = await pool.query('SELECT id FROM bank_transactions WHERE fitid = $1', [fitid]);
            if (exists.rows.length === 0) {
                await pool.query('INSERT INTO bank_transactions (fitid, amount, description, transaction_date, status) VALUES ($1, $2, $3, $4, $5)', [fitid, amount, memo, date, 'pending']);
                importedCount++;
            }
            else {
                skippedCount++;
            }
        }
        return { imported: importedCount, skipped: skippedCount };
    }
    catch (error) {
        console.error('Error parsing OFX:', error);
        throw new Error('Failed to parse OFX file');
    }
};
export const reconcileTransactions = async () => {
    const pool = getPool();
    // Simple reconciliation logic: Match bank transaction amount and date with sales/expenses
    // This is a placeholder for complex logic
    const { rows: matches } = await pool.query(`
    UPDATE bank_transactions bt
    SET status = 'reconciled', related_entity_id = s.id, related_entity_type = 'sale'
    FROM sales s
    WHERE bt.status = 'pending'
      AND s.total_amount = bt.amount
      AND s.sale_date::date = bt.transaction_date::date
    RETURNING bt.id;
  `);
    return matches.length;
};
