import pool from '../db/index.js';

export interface PurchaseSuggestion {
  productId: number;
  productName: string;
  currentStock: number;
  avgWeeklyConsumption: number;
  daysOfCover: number;
  suggestedQuantity: number;
  classification?: 'A' | 'B' | 'C';
}

export interface ABCAnalysisItem {
  productId: number;
  productName: string;
  revenue: number;
  share: number;
  cumulativeShare: number;
  classification: 'A' | 'B' | 'C';
}

export const demandForecastingService = {
  /**
   * Realiza a análise Curva ABC baseada no faturamento dos últimos 90 dias.
   */
  async getABCAnalysis(): Promise<ABCAnalysisItem[]> {
    const result = await pool.query(`
      WITH product_revenue AS (
        SELECT 
          p.id as product_id,
          p.name,
          SUM(si.quantity * si.unit_price) as total_revenue
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        JOIN products p ON si.product_id = p.id
        WHERE s.sale_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY p.id, p.name
      ),
      total_system_revenue AS (
        SELECT SUM(total_revenue) as grand_total FROM product_revenue
      ),
      ranked_products AS (
        SELECT 
          pr.*,
          (pr.total_revenue / tsr.grand_total) * 100 as share,
          SUM(pr.total_revenue / tsr.grand_total * 100) OVER (ORDER BY pr.total_revenue DESC) as cumulative_share
        FROM product_revenue pr, total_system_revenue tsr
      )
      SELECT * FROM ranked_products ORDER BY total_revenue DESC
    `);

    return result.rows.map((row) => ({
      productId: row.product_id,
      productName: row.name,
      revenue: parseFloat(row.total_revenue),
      share: parseFloat(row.share),
      cumulativeShare: parseFloat(row.cumulative_share),
      classification: row.cumulative_share <= 80 ? 'A' : row.cumulative_share <= 95 ? 'B' : 'C',
    }));
  },

  async getPurchaseSuggestions(): Promise<PurchaseSuggestion[]> {
    const abc = await this.getABCAnalysis();
    const abcMap = new Map(abc.map((item) => [item.productId, item.classification]));

    const client = await pool.connect();
    try {
      // ... (existing logic remains same but we use the map at the end)
      const consumptionQuery = `
        WITH weekly_consumption AS (
            SELECT 
                si.product_id,
                SUM(si.quantity) / 8.0 as avg_weekly_consumption
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            WHERE s.sale_date >= CURRENT_DATE - INTERVAL '8 weeks'
            GROUP BY si.product_id
            
            UNION ALL
            
            SELECT 
                soi.part_id as product_id,
                SUM(soi.quantity) / 8.0 as avg_weekly_consumption
            FROM service_order_items soi
            JOIN service_orders so ON soi.service_order_id = so.id
            WHERE so.created_at >= CURRENT_DATE - INTERVAL '8 weeks'
            AND soi.part_id IS NOT NULL
            GROUP BY soi.part_id
        ),
        total_consumption AS (
            SELECT product_id, SUM(avg_weekly_consumption) as avg_consumption
            FROM weekly_consumption
            GROUP BY product_id
        )
        SELECT 
            tc.product_id,
            p.name as product_name,
            COALESCE(SUM(bpvs.stock_quantity), 0) as current_stock,
            tc.avg_consumption
        FROM total_consumption tc
        JOIN products p ON tc.product_id = p.id
        LEFT JOIN product_variations pv ON p.id = pv.product_id
        LEFT JOIN branch_product_variations_stock bpvs ON pv.id = bpvs.product_variation_id
        WHERE tc.avg_consumption > 0
        GROUP BY tc.product_id, p.name, tc.avg_consumption
      `;

      const result = await client.query(consumptionQuery);

      const suggestions: PurchaseSuggestion[] = [];

      for (const row of result.rows) {
        const dailyConsumption = row.avg_consumption / 7;
        const daysOfCover = dailyConsumption > 0 ? row.current_stock / dailyConsumption : 999;

        // Regra Dinâmica: Itens 'A' sugerem estoque para 45 dias, 'C' apenas 15 dias para não imobilizar capital
        const classification = abcMap.get(row.product_id) || 'C';
        const targetDays = classification === 'A' ? 45 : classification === 'B' ? 30 : 15;
        const criticalThreshold = classification === 'A' ? 14 : 7; // Itens A pedem compra com 2 semanas de antecedência

        if (daysOfCover < criticalThreshold) {
          const targetStock = dailyConsumption * targetDays;
          const toBuy = Math.ceil(targetStock - row.current_stock);

          if (toBuy > 0) {
            suggestions.push({
              productId: row.product_id,
              productName: row.product_name,
              currentStock: parseInt(row.current_stock),
              avgWeeklyConsumption: parseFloat(row.avg_consumption).toFixed(2) as any,
              daysOfCover: Math.floor(daysOfCover),
              suggestedQuantity: toBuy,
              classification,
            });
          }
        }
      }

      return suggestions;
    } finally {
      client.release();
    }
  },
};
