import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

export const demandPredictionService = {
  /**
   * Prevê a demanda para um produto com base no histórico de vendas.
   * Por enquanto, uma previsão simples baseada na média dos últimos N meses.
   * Pode ser expandido com modelos de ML, sazonalidade, etc.
   * @param productId ID do produto
   * @param numberOfMonths O número de meses anteriores para calcular a média.
   * @returns Previsão de demanda para o próximo mês.
   */
  async predictDemand(productId: string, numberOfMonths: number = 3): Promise<number> {
    if (!productId) {
      throw new AppError('Product ID is required for demand prediction.', 400);
    }

    // Calcula a data de início para buscar o histórico de vendas
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numberOfMonths);
    const startDateFormatted = startDate.toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT
         COALESCE(SUM(si.quantity), 0) AS total_quantity_sold
       FROM sales s
       JOIN sale_items si ON s.id = si.sale_id
       JOIN product_variations pv ON si.variation_id = pv.id
       WHERE pv.product_id = $1 AND s.sale_date >= $2;`,
      [productId, startDateFormatted]
    );

    const totalQuantitySold = parseInt(rows[0].total_quantity_sold || '0');
    // Previsão simples: média mensal das vendas no período
    const predictedDemand = totalQuantitySold / numberOfMonths;

    return predictedDemand;
  },
};
