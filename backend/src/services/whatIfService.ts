import pool from '../db/index.js';

export const whatIfService = {
  async simulate(variables: {
    printPriceMultiplier: number;
    salesVolumeMultiplier: number;
    costMultiplier: number;
  }) {
    const client = await pool.connect();
    try {
      // 1. Obter base histórica (último mês)
      const baseQuery = `
        SELECT 
            (SELECT SUM(total_amount) FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days') as total_sales,
            (SELECT SUM(base_amount) FROM commissions_earned WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as total_service_revenue
      `;

      const baseRes = await client.query(baseQuery);
      const baseSales = Number(baseRes.rows[0].total_sales || 0);
      const baseServices = Number(baseRes.rows[0].total_service_revenue || 0);
      const baseRevenue = baseSales + baseServices;

      // 2. Aplicar Projeções
      const projectedSales = baseSales * variables.salesVolumeMultiplier;
      const projectedServices = baseServices; // Assumindo volume fixo por enquanto
      const projectedRevenue = projectedSales + projectedServices;

      // Impacto no lucro (assumindo margem média de 30% e custos variáveis de 70%)
      const baseProfit = baseRevenue * 0.3;
      const projectedProfit = projectedRevenue * 0.3 * (1 / variables.costMultiplier);

      return {
        baseline: {
          revenue: baseRevenue.toFixed(2),
          profit: baseProfit.toFixed(2),
        },
        projection: {
          revenue: projectedRevenue.toFixed(2),
          profit: projectedProfit.toFixed(2),
          impact: (projectedProfit - baseProfit).toFixed(2),
        },
      };
    } finally {
      client.release();
    }
  },
};
