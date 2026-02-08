import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface DashboardFilters {
  period?: string;
  startDate?: string;
  endDate?: string;
  salesperson?: string;
  product?: string;
  region?: string;
}

export interface SalesStat {
  total_sales: number;
}

export interface MonthlySalesStat {
  month: string;
  monthly_sales: number;
}

export interface TopProductStat {
  product_name: string;
  variation_color: string;
  total_quantity_sold: number;
}

export interface RecentSale {
  id: number;
  total_amount: number;
  sale_date: Date;
}

export interface SlowMovingProduct {
  name: string;
  color: string;
  quantity: number;
  last_sale_date: Date | null;
  days_since_sale: number | null;
}

export interface SalesForecast {
  current_sales: number;
  projected_sales: number;
}

export interface SalespersonTicket {
  user_name: string;
  avg_ticket: number;
  total_sales: number;
}

export interface StockABCItem {
  name: string;
  total_revenue: number;
  category: 'A' | 'B' | 'C';
}

export interface HourlySales {
  hour: number;
  day_of_week: number;
  sales_count: number;
  total_revenue: number;
}

export class DashboardRepository {
  private get db(): Pool {
    return getPool();
  }

  // Helper para construir cláusulas WHERE dinâmicas
  private buildWhereClause(
    filters: DashboardFilters,
    tableAlias: string = 's',
    periodParams?: { period?: string; startDate?: string; endDate?: string },
  ) {
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Período
    const p = periodParams || filters;
    const { period, startDate, endDate } = p;

    if (period && period !== 'custom') {
      switch (period) {
        case 'today':
          conditions.push(`${tableAlias}.sale_date = CURRENT_DATE`);
          break;
        case 'last7days':
          conditions.push(`${tableAlias}.sale_date >= CURRENT_DATE - INTERVAL '7 days'`);
          break;
        case 'last30days':
          conditions.push(`${tableAlias}.sale_date >= CURRENT_DATE - INTERVAL '30 days'`);
          break;
        case 'thisMonth':
          conditions.push(
            `EXTRACT(MONTH FROM ${tableAlias}.sale_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
          );
          break;
        case 'lastMonth':
          conditions.push(
            `EXTRACT(MONTH FROM ${tableAlias}.sale_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month') AND EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')`,
          );
          break;
        case 'thisYear':
          conditions.push(
            `EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
          );
          break;
        // Casos de comparação internos
        case 'lastYear':
          conditions.push(
            `EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 year')`,
          );
          break;
        case 'twoMonthsAgo':
          conditions.push(
            `EXTRACT(MONTH FROM ${tableAlias}.sale_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '2 months') AND EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '2 months')`,
          );
          break;
        case 'yesterday':
          conditions.push(`${tableAlias}.sale_date = CURRENT_DATE - INTERVAL '1 day'`);
          break;
        case 'previous7days':
          conditions.push(
            `${tableAlias}.sale_date BETWEEN CURRENT_DATE - INTERVAL '14 days' AND CURRENT_DATE - INTERVAL '8 days'`,
          );
          break;
        case 'previous30days':
          conditions.push(
            `${tableAlias}.sale_date BETWEEN CURRENT_DATE - INTERVAL '60 days' AND CURRENT_DATE - INTERVAL '31 days'`,
          );
          break;
      }
    } else if (period === 'custom' && startDate && endDate) {
      conditions.push(`${tableAlias}.sale_date BETWEEN $${paramIndex++} AND $${paramIndex++}`);
      params.push(startDate, endDate);
    }

    // Filtros adicionais
    if (filters.salesperson && filters.salesperson !== 'Todos') {
      conditions.push(`${tableAlias}.user_id = $${paramIndex++}`);
      params.push(filters.salesperson);
    }

    if (filters.product && filters.product !== 'Todos') {
      conditions.push(
        `EXISTS (SELECT 1 FROM sale_items si JOIN product_variations pv ON si.variation_id = pv.id WHERE si.sale_id = ${tableAlias}.id AND pv.product_id = $${paramIndex++})`,
      );
      params.push(filters.product);
    }

    if (filters.region && filters.region !== 'Todas') {
      // Nota: Ajuste conforme seu schema real de customers.region
      conditions.push(
        `EXISTS (SELECT 1 FROM customers c WHERE c.id = ${tableAlias}.customer_id AND c.region = $${paramIndex++})`,
      );
      params.push(filters.region);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  async getTotalSales(
    filters: DashboardFilters,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<number> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);
    const { rows } = await this.db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales s ${whereClause};`,
      params,
    );
    return parseFloat(rows[0].total_sales);
  }

  async getSalesByMonth(
    filters: DashboardFilters,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<MonthlySalesStat[]> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);
    const { rows } = await this.db.query(
      `SELECT
        TO_CHAR(sale_date, 'YYYY-MM') AS month,
        COALESCE(SUM(total_amount), 0) AS monthly_sales
      FROM sales s
      ${whereClause}
      GROUP BY month
      ORDER BY month ASC;`,
      params,
    );
    return rows.map((row) => ({ month: row.month, monthly_sales: parseFloat(row.monthly_sales) }));
  }

  async getTopSellingProducts(
    filters: DashboardFilters,
    limit: number,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<TopProductStat[]> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);
    const { rows } = await this.db.query(
      `SELECT
        p.name AS product_name,
        pv.color AS variation_color,
        SUM(si.quantity) AS total_quantity_sold
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      ${whereClause}
      GROUP BY p.name, pv.color
      ORDER BY total_quantity_sold DESC
      LIMIT $${params.length + 1};`,
      [...params, limit],
    );
    return rows.map((row) => ({ ...row, total_quantity_sold: parseInt(row.total_quantity_sold) }));
  }

  async getRecentSales(
    filters: DashboardFilters,
    limit: number,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<RecentSale[]> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);
    const { rows } = await this.db.query(
      `SELECT
        id,
        total_amount,
        sale_date
      FROM sales s
      ${whereClause}
      ORDER BY sale_date DESC
      LIMIT $${params.length + 1};`,
      [...params, limit],
    );
    return rows.map((row) => ({ ...row, total_amount: parseFloat(row.total_amount) }));
  }

  async getSlowMovingProducts(
    filters: DashboardFilters,
    days: number,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<SlowMovingProduct[]> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);
    // Nota: A lógica de slow moving é complexa pois olha para product_stock E sales.
    // Se usarmos filtros de período na query de sales (que é usada no HAVING), funciona.

    // A query original tinha um bug potencial: HAVING MAX(s.sale_date) < NOW() - interval
    // Isso pega produtos que NÃO venderam recentemente.
    // O filtro de período 'filters' deve se aplicar ao escopo de "vendas consideradas"?
    // Geralmente slow moving olha "desde sempre" até "agora - dias".
    // Mas se o usuário filtra por 'Ano Passado', ele quer ver produtos que não giraram NO ANO PASSADO?
    // Vou manter a query original adaptada.

    const { rows } = await this.db.query(
      `SELECT
          p.name,
          pv.color,
          ps.quantity,
          MAX(s.sale_date) as last_sale_date,
          EXTRACT(DAY FROM NOW() - MAX(s.sale_date)) as days_since_sale
        FROM product_stock ps
        JOIN product_variations pv ON ps.product_variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN sale_items si ON pv.id = si.variation_id
        LEFT JOIN sales s ON si.sale_id = s.id
        ${whereClause ? whereClause + ' AND' : 'WHERE'} ps.quantity > 0
        GROUP BY p.name, pv.color, ps.quantity
        HAVING MAX(s.sale_date) < NOW() - make_interval(days => $${params.length + 1}::int) OR MAX(s.sale_date) IS NULL
        ORDER BY last_sale_date ASC NULLS FIRST
        LIMIT 10;`,
      [...params, days],
    );
    return rows;
  }

  async getSalesForecast(
    filters: DashboardFilters,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<SalesForecast> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);

    // Forecast geralmente é "mês atual". Se o filtro for outro, a lógica pode falhar.
    // A query original forçava: s.sale_date >= DATE_TRUNC('MONTH', NOW())
    // Se o filtro for "lastYear", forecast não faz sentido da mesma forma (seria "o que foi previsto").
    // Vou assumir que a query original estava correta para o contexto de "Forecasting do período atual".
    // Mas a query original tinha `WHERE ... AND s.sale_date >= DATE_TRUNC...`
    // Vou manter a lógica mas permitir que o whereClause controle o range se for passado.

    const { rows } = await this.db.query(
      `WITH monthly_stats AS (
          SELECT
            COALESCE(SUM(total_amount), 0) as current_sales,
            EXTRACT(DAY FROM NOW()) as days_passed,
            EXTRACT(DAY FROM (DATE_TRUNC('MONTH', NOW()) + INTERVAL '1 MONTH - 1 day')) as total_days_in_month
          FROM sales s
          ${whereClause ? whereClause + ' AND' : 'WHERE'} s.sale_date >= DATE_TRUNC('MONTH', NOW())
        )
        SELECT
          current_sales,
          (current_sales / GREATEST(days_passed, 1)) * total_days_in_month as projected_sales
        FROM monthly_stats;`,
      params,
    );
    return {
      current_sales: parseFloat(rows[0].current_sales),
      projected_sales: parseFloat(rows[0].projected_sales),
    };
  }

  async getAverageTicket(
    filters: DashboardFilters,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<SalespersonTicket[]> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);
    const { rows } = await this.db.query(
      `SELECT
          u.name as user_name,
          AVG(s.total_amount) as avg_ticket,
          COUNT(s.id) as total_sales
        FROM sales s
        JOIN users u ON s.user_id = u.id
        ${whereClause ? whereClause + ' AND' : 'WHERE'} s.sale_date >= DATE_TRUNC('MONTH', NOW())
        GROUP BY u.name
        ORDER BY avg_ticket DESC;`,
      params,
    );
    return rows.map((row) => ({
      user_name: row.user_name,
      avg_ticket: parseFloat(row.avg_ticket),
      total_sales: parseInt(row.total_sales),
    }));
  }

  async getStockABC(): Promise<StockABCItem[]> {
    const { rows } = await this.db.query(`
      WITH product_stats AS (
        SELECT 
          p.name,
          SUM(si.quantity * si.unit_price) as total_revenue,
          SUM(si.quantity) as total_quantity
        FROM sale_items si
        JOIN product_variations pv ON si.variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        GROUP BY p.name
      ),
      ranked_products AS (
        SELECT 
          name,
          total_revenue,
          SUM(total_revenue) OVER (ORDER BY total_revenue DESC) / SUM(total_revenue) OVER () as cumulative_share
        FROM product_stats
      )
      SELECT 
        name,
        total_revenue,
        CASE 
          WHEN cumulative_share <= 0.7 THEN 'A'
          WHEN cumulative_share <= 0.9 THEN 'B'
          ELSE 'C'
        END as category
      FROM ranked_products
      ORDER BY total_revenue DESC;
    `);
    return rows;
  }

  async getHourlySales(
    filters: DashboardFilters,
    periodOverride?: { period?: string; startDate?: string; endDate?: string },
  ): Promise<HourlySales[]> {
    const { whereClause, params } = this.buildWhereClause(filters, 's', periodOverride);
    const { rows } = await this.db.query(
      `
      SELECT 
        EXTRACT(HOUR FROM sale_date) as hour,
        EXTRACT(DOW FROM sale_date) as day_of_week,
        COUNT(*) as sales_count,
        SUM(total_amount) as total_revenue
      FROM sales s
      ${whereClause}
      GROUP BY hour, day_of_week
      ORDER BY day_of_week, hour;
    `,
      params,
    );
    return rows;
  }
}

export const dashboardRepository = new DashboardRepository();
