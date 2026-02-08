import pool from '../db/index.js';

export const repairAnalyticsService = {
  async getRepairTrends() {
    const client = await pool.connect();
    try {
      // Analisar frequência de problemas por modelo nos últimos 3 meses
      const query = `
        SELECT 
            product_description as model,
            COUNT(*) as frequency,
            AVG(estimated_cost) as avg_cost
        FROM service_orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 10
      `;

      const result = await client.query(query);

      // Simular detecção de picos (anomalias)
      const trends = result.rows.map((row) => ({
        ...row,
        spikeDetected: row.frequency > 10, // Mock: Mais de 10 reparos no trimestre é alerta
        recommendation:
          row.frequency > 10
            ? `Aumento de ${row.model} detectado. Reforce o estoque de peças compatíveis.`
            : 'Normal',
      }));

      return trends;
    } finally {
      client.release();
    }
  },
};
