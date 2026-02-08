import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface MonthlySales {
  month: string; // YYYY-MM
  quantity: number;
}

export class PredictionRepository {
  private get db(): Pool {
    return getPool();
  }

  async getMonthlySalesHistory(
    productId: number | string,
    months: number,
  ): Promise<MonthlySales[]> {
    const { rows } = await this.db.query(
      `SELECT
         TO_CHAR(s.sale_date, 'YYYY-MM') as month,
         COALESCE(SUM(si.quantity), 0) AS quantity
       FROM sales s
       JOIN sale_items si ON s.id = si.sale_id
       JOIN product_variations pv ON si.variation_id = pv.id
       WHERE pv.product_id = $1 
         AND s.sale_date >= CURRENT_DATE - make_interval(months => $2)
       GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM')
       ORDER BY month ASC;`,
      [productId, months],
    );
    return rows.map((r) => ({
      month: r.month,
      quantity: parseInt(r.quantity),
    }));
  }
}

export const predictionRepository = new PredictionRepository();
