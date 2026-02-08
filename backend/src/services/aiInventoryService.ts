import pool from '../db/index.js';
import { logger } from '../utils/logger.js';

export interface PredictiveModel {
  name: string;
  predictStockDepletion(branchId: number): Promise<PredictionResult[]>;
}

export interface PredictionResult {
  productName: string;
  variation: string;
  stock: number;
  burnRate: string;
  daysRemaining: number;
  priority: 'low' | 'medium' | 'high';
  recommendedAction: string;
}

/**
 * Modelo Heurístico (Baseado em Estatística Simples)
 * Ideal para quando não há conexão com LLMs externos.
 */
class HeuristicModel implements PredictiveModel {
  name = 'Statistical Heuristic Engine';

  async predictStockDepletion(branchId: number): Promise<PredictionResult[]> {
    const query = `
      SELECT 
        p.name,
        v.color,
        v.storage_capacity,
        v.stock_quantity,
        COALESCE(SUM(si.quantity), 0) as sales_last_30_days,
        (COALESCE(SUM(si.quantity), 0) / 30.0) as daily_burn_rate
      FROM products p
      JOIN product_variations v ON p.id = v.product_id
      LEFT JOIN sale_items si ON v.id = si.variation_id
      LEFT JOIN sales s ON si.sale_id = s.id AND s.sale_date > NOW() - INTERVAL '30 days'
      WHERE p.branch_id = $1
      GROUP BY p.id, v.id
    `;

    const { rows } = await pool.query(query, [branchId]);

    return rows.map(row => {
      const dailyBurn = parseFloat(row.daily_burn_rate);
      const daysRemaining = dailyBurn > 0 
        ? Math.floor(row.stock_quantity / dailyBurn) 
        : 999;
      
      let priority: 'low' | 'medium' | 'high' = 'low';
      let action = 'Monitorar';

      if (daysRemaining < 3) {
        priority = 'high';
        action = 'COMPRA IMEDIATA';
      } else if (daysRemaining < 7) {
        priority = 'medium';
        action = 'Planejar Reposição';
      }

      return {
        productName: row.name,
        variation: `${row.color} ${row.storage_capacity || ''}`.trim(),
        stock: row.stock_quantity,
        burnRate: dailyBurn.toFixed(2),
        daysRemaining,
        priority,
        recommendedAction: action
      };
    }).filter(insight => insight.daysRemaining < 15);
  }
}

/**
 * Factory para instanciar o modelo correto baseado em variáveis de ambiente.
 */
const getModel = (): PredictiveModel => {
  // Futuro: if (process.env.OPENAI_API_KEY) return new OpenAIModel();
  return new HeuristicModel();
};

export const aiInventoryService = {
  async getPredictiveInsights(branchId: number) {
    const model = getModel();
    logger.info(`[AI] Gerando insights usando motor: ${model.name}`);
    return model.predictStockDepletion(branchId);
  }
};
