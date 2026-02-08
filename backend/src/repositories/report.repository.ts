import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export class ReportRepository {
  private get db(): Pool {
    return getPool();
  }

  async runDynamicQuery(
    dimension: string,
    measure: string,
    filter: { startDate: string; endDate: string },
    groupBy: string,
  ): Promise<any[]> {
    // Validação básica para evitar SQL Injection (em um cenário real, usaria um query builder como Knex)
    const allowedDimensions = [
      'sale_date',
      'product_name',
      'category',
      'branch_name',
      'salesperson',
    ];
    const allowedMeasures = ['total_amount', 'quantity', 'profit'];

    if (!allowedDimensions.includes(groupBy) || !allowedMeasures.includes(measure)) {
      throw new Error('Invalid query parameters');
    }

    // Mapeamento simples
    const mapDim = {
      sale_date: 'DATE(s.sale_date)',
      product_name: 'p.name',
      category: 'c.name',
      branch_name: 'b.name',
      salesperson: 'u.name',
    };

    const mapMeasure = {
      total_amount: 'SUM(si.total_price)',
      quantity: 'SUM(si.quantity)',
      profit: 'SUM(si.total_price - si.cost_price)',
    };

    const query = `
        SELECT ${mapDim[groupBy as keyof typeof mapDim]} as label, ${mapMeasure[measure as keyof typeof mapMeasure]} as value
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN product_variations pv ON si.variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN branches b ON s.branch_id = b.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.sale_date BETWEEN $1 AND $2
        GROUP BY ${mapDim[groupBy as keyof typeof mapDim]}
        ORDER BY value DESC
        LIMIT 20;
    `;

    const { rows } = await this.db.query(query, [filter.startDate, filter.endDate]);
    return rows;
  }
}

export const reportRepository = new ReportRepository();
