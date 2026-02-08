import { AppError } from '../utils/errors.js';
import { predictionRepository } from '../repositories/prediction.repository.js';

export const demandPredictionService = {
  /**
   * Prevê a demanda para um produto usando Média Móvel Ponderada.
   * Dá mais peso aos meses recentes para capturar tendências.
   * @param productId ID do produto
   * @param numberOfMonths O número de meses anteriores a considerar (padrão: 3).
   * @returns Previsão de demanda para o próximo mês.
   */
  async predictDemand(productId: string | number, numberOfMonths: number = 3): Promise<number> {
    if (!productId) {
      throw new AppError('Product ID is required for demand prediction.', 400);
    }

    const history = await predictionRepository.getMonthlySalesHistory(productId, numberOfMonths);

    if (history.length === 0) {
      return 0;
    }

    // Algoritmo de Média Ponderada
    // Ex para 3 meses: (M1*1 + M2*2 + M3*3) / (1+2+3)
    // Onde M3 é o mais recente

    let weightedSum = 0;
    let weightTotal = 0;

    history.forEach((data, index) => {
      const weight = index + 1; // Meses mais recentes (índice maior) ganham mais peso
      weightedSum += data.quantity * weight;
      weightTotal += weight;
    });

    const predictedDemand = weightTotal > 0 ? weightedSum / weightTotal : 0;

    return Math.ceil(predictedDemand); // Arredondar para cima (segurança de estoque)
  },
};
