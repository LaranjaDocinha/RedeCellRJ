import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface CommissionData {
  id: number;
  total_amount: number;
  sale_date: Date;
  items_count: number;
  calculated_commission: number;
}

export class CommissionRepository {
  private get db(): Pool {
    return getPool();
  }

  async getSalespersonCommissions(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<CommissionData[]> {
    const { rows } = await this.db.query(
      `
      SELECT 
        s.id,
        s.total_amount,
        s.sale_date,
        COUNT(si.id) as items_count,
        SUM(CASE WHEN p.product_type = 'Peça' THEN si.total_price * 0.05 ELSE si.total_price * 0.02 END) as calculated_commission
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.user_id = $1 AND s.sale_date BETWEEN $2 AND $3
      GROUP BY s.id, s.total_amount, s.sale_date
      ORDER BY s.sale_date DESC;
    `,
      [userId, startDate, endDate],
    );

    return rows.map((row) => ({
      ...row,
      total_amount: parseFloat(row.total_amount),
      items_count: parseInt(row.items_count),
      calculated_commission: parseFloat(row.calculated_commission),
    }));
  }
}

export const commissionRepository = new CommissionRepository();
