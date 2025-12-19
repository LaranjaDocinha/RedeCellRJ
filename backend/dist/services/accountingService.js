import { stringify } from 'csv-stringify/sync';
import pool from '../db/index.js';
// Generates a CSV file formatted for a generic accounting software
export const exportSalesForAccounting = async (startDate, endDate) => {
    const salesRes = await pool.query('SELECT * FROM sales WHERE sale_date BETWEEN $1 AND $2', [
        startDate,
        endDate,
    ]);
    const columns = [
        'sale_date',
        'total_amount',
        'customer_id',
        // ... other relevant fields
    ];
    const csvString = stringify(salesRes.rows, { header: true, columns: columns });
    return csvString;
};
