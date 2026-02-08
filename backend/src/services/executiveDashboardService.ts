import pool from '../db/index.js';

export const executiveDashboardService = {
  async getStats() {
    const client = await pool.connect();
    try {
      // 1. Sales Split (Physical vs Online)
      const salesByChannel = await client.query(`
        SELECT 
            CASE 
                WHEN marketplace_integration_id IS NOT NULL THEN 'Online'
                ELSE 'Physical'
            END as channel, 
            COUNT(*) as count, 
            SUM(total_amount) as revenue 
        FROM sales 
        WHERE sale_date > NOW() - INTERVAL '30 days'
        GROUP BY 1
      `);

      // 2. Average Margin (Profitability)
      const marginStats = await client.query(`
        SELECT 
            AVG(CASE WHEN unit_price > 0 THEN (unit_price - cost_price) / unit_price ELSE 0 END) * 100 as avg_margin
        FROM sale_items
        JOIN sales ON sale_items.sale_id = sales.id
        WHERE sales.sale_date > NOW() - INTERVAL '30 days'
      `);

      // 3. Service Orders Conversion
      const serviceStats = await client.query(`
        SELECT 
            COUNT(*) FILTER (WHERE status = 'Finalizado') as completed,
            COUNT(*) as total
        FROM service_orders
        WHERE created_at > NOW() - INTERVAL '30 days'
      `);

      return {
        salesByChannel: salesByChannel.rows,
        avgMargin: parseFloat(marginStats.rows[0]?.avg_margin || '0').toFixed(2),
        serviceConversion: serviceStats.rows[0],
        insights: this.generateInsights(
          salesByChannel.rows,
          marginStats.rows[0]?.avg_margin,
          serviceStats.rows[0],
        ),
      };
    } finally {
      client.release();
    }
  },

  generateInsights(sales: any[], margin: any, service: any) {
    const insights: string[] = [];

    // Insight de Canal
    const online = sales.find((s) => s.channel === 'Online')?.revenue || 0;
    const physical = sales.find((s) => s.channel === 'Physical')?.revenue || 0;
    const total = Number(online) + Number(physical);

    if (total > 0) {
      const onlinePercent = (Number(online) / total) * 100;
      insights.push(
        `O canal **${onlinePercent > 50 ? 'Online' : 'Físico'}** é sua maior fonte de receita atualmente (${onlinePercent > 50 ? onlinePercent.toFixed(0) : (100 - onlinePercent).toFixed(0)}%).`,
      );
    }

    // Insight de Margem
    if (margin > 40) {
      insights.push(
        `Sua margem média de **${Number(margin).toFixed(1)}%** está excelente, bem acima da média do setor.`,
      );
    } else if (margin < 20) {
      insights.push(
        `Atenção: sua margem de **${Number(margin).toFixed(1)}%** está baixa. Considere revisar os preços ou custos de aquisição.`,
      );
    }

    // Insight de Conversão
    if (service.total > 0) {
      const conv = (service.completed / service.total) * 100;
      if (conv > 70) {
        insights.push(
          `Seu time técnico está com uma alta taxa de fechamento: **${conv.toFixed(0)}%** das OS são finalizadas.`,
        );
      } else {
        insights.push(
          `A taxa de conversão de OS está em **${conv.toFixed(0)}%**. Há espaço para melhorar o fechamento de orçamentos.`,
        );
      }
    }

    return insights;
  },
};
