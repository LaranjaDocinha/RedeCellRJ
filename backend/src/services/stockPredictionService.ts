import pool from '../db/index.js';

export const stockPredictionService = {
  /**
   * Analisa dados históricos de vendas e reparos para prever a demanda futura por variações de produtos e peças.
   * @param lookbackDays Número de dias para analisar o histórico.
   * @param predictionDays Número de dias para prever a demanda futura.
   * @returns Lista de itens (variações de produtos ou peças) com demanda prevista e alertas de estoque.
   */
  async predictStockNeeds(lookbackDays: number = 90, predictionDays: number = 30): Promise<any[]> {
    const now = new Date();
    const lookbackDate = new Date(now.setDate(now.getDate() - lookbackDays));

    // 1. Obter dados históricos de vendas de variações de produtos
    const salesDataRes = await pool.query(
      `SELECT
         pv.id as item_id,
         'product_variation' as item_type,
         SUM(si.quantity) as total_sold_quantity
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN product_variations pv ON si.variation_id = pv.id
       WHERE s.sale_date >= $1
       GROUP BY pv.id`,
      [lookbackDate.toISOString()],
    );

    // 2. Obter dados históricos de peças usadas em reparos
    const repairDataRes = await pool.query(
      `SELECT
         p.id as item_id,
         'part' as item_type,
         SUM(soi.quantity) as total_repaired_quantity
       FROM service_order_items soi
       JOIN service_orders so ON soi.service_order_id = so.id
       JOIN parts p ON soi.part_id = p.id
       WHERE so.created_at >= $1 AND soi.part_id IS NOT NULL
       GROUP BY p.id`,
      [lookbackDate.toISOString()],
    );

    // Consolidar demanda histórica
    const historicalDemand: { [key: string]: { type: string; demand: number } } = {}; // Key: "type_id"
    salesDataRes.rows.forEach((row) => {
      const key = `product_variation_${row.item_id}`;
      historicalDemand[key] = {
        type: 'product_variation',
        demand: (historicalDemand[key]?.demand || 0) + parseInt(row.total_sold_quantity),
      };
    });
    repairDataRes.rows.forEach((row) => {
      const key = `part_${row.item_id}`;
      historicalDemand[key] = {
        type: 'part',
        demand: (historicalDemand[key]?.demand || 0) + parseInt(row.total_repaired_quantity),
      };
    });

    const predictions = [];

    // Para cada variação de produto, prever a demanda e verificar o estoque
    const allProductVariationsRes = await pool.query(
      `SELECT 
        pv.id, 
        pv.product_id, 
        COALESCE(SUM(bpvs.stock_quantity), 0) as stock_quantity, 
        pv.low_stock_threshold 
      FROM product_variations pv
      LEFT JOIN branch_product_variations_stock bpvs ON pv.id = bpvs.product_variation_id
      GROUP BY pv.id, pv.product_id, pv.low_stock_threshold`,
    );
    for (const variation of allProductVariationsRes.rows) {
      const { id: item_id, product_id, stock_quantity, low_stock_threshold } = variation;
      const key = `product_variation_${item_id}`;
      const historicalDemandForVariation = historicalDemand[key]?.demand || 0;

      const dailyDemandRate = historicalDemandForVariation / lookbackDays;
      const predictedDemand = dailyDemandRate * predictionDays;
      const remainingStockAfterPrediction = Number(stock_quantity) - predictedDemand;

      if (remainingStockAfterPrediction < (low_stock_threshold || 0)) {
        predictions.push({
          item_id,
          item_type: 'product_variation',
          product_id,
          current_stock: Number(stock_quantity),
          low_stock_threshold,
          historical_demand_lookback_days: lookbackDays,
          predicted_demand_next_days: predictionDays,
          predicted_demand_quantity: parseFloat(predictedDemand.toFixed(2)),
          remaining_stock_after_prediction: parseFloat(remainingStockAfterPrediction.toFixed(2)),
          alert: `Estoque baixo previsto para a variação de produto ${item_id}. Demanda prevista: ${parseFloat(predictedDemand.toFixed(2))}, Estoque restante: ${parseFloat(remainingStockAfterPrediction.toFixed(2))}`,
        });
      }
    }

    // Para cada peça, prever a demanda e verificar o estoque
    const allPartsRes = await pool.query(
      'SELECT id, name, stock_quantity, low_stock_threshold FROM parts',
    );
    for (const part of allPartsRes.rows) {
      const { id: item_id, name, stock_quantity, low_stock_threshold } = part;
      const key = `part_${item_id}`;
      const historicalDemandForPart = historicalDemand[key]?.demand || 0;

      const dailyDemandRate = historicalDemandForPart / lookbackDays;
      const predictedDemand = dailyDemandRate * predictionDays;
      const remainingStockAfterPrediction = stock_quantity - predictedDemand;

      if (remainingStockAfterPrediction < (low_stock_threshold || 0)) {
        predictions.push({
          item_id,
          item_type: 'part',
          name,
          current_stock: stock_quantity,
          low_stock_threshold,
          historical_demand_lookback_days: lookbackDays,
          predicted_demand_next_days: predictionDays,
          predicted_demand_quantity: parseFloat(predictedDemand.toFixed(2)),
          remaining_stock_after_prediction: parseFloat(remainingStockAfterPrediction.toFixed(2)),
          alert: `Estoque baixo previsto para a peça ${name} (ID: ${item_id}). Demanda prevista: ${parseFloat(predictedDemand.toFixed(2))}, Estoque restante: ${parseFloat(remainingStockAfterPrediction.toFixed(2))}`,
        });
      }
    }

    return predictions;
  },
};
