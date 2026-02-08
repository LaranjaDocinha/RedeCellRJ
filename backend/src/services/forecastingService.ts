import { query } from '../db/index.js';

export const generatePurchaseSuggestions = async () => {
  // 1. Buscar histórico de vendas dos últimos 90 dias agrupado por produto
  const salesHistory = await query(`
    SELECT 
      p.id, 
      p.name, 
      p.stock_quantity, 
      p.min_stock_level,
      SUM(si.quantity) as total_sold_90d
    FROM products p
    LEFT JOIN product_variations pv ON p.id = pv.product_id
    LEFT JOIN sale_items si ON pv.id = si.variation_id
    LEFT JOIN sales s ON si.sale_id = s.id
    WHERE s.sale_date >= NOW() - INTERVAL '90 days'
    GROUP BY p.id
  `);

  const suggestions = salesHistory.rows.map((product: any) => {
    const totalSold = Number(product.total_sold_90d || 0);
    const avgDailySales = totalSold / 90;

    // Regra: Estoque para cobrir 30 dias + Margem de segurança de 20%
    const idealStock = Math.ceil(avgDailySales * 30 * 1.2);
    const currentStock = Number(product.stock_quantity || 0);

    // Sugestão de compra: Ideal - Atual. Se negativo, é zero.
    const toBuy = Math.max(0, idealStock - currentStock);

    // Status do inventário
    let status = 'healthy';
    if (currentStock === 0) status = 'critical';
    else if (currentStock < (product.min_stock_level || 5)) status = 'low';
    else if (currentStock > idealStock * 2) status = 'overstocked';

    return {
      productId: product.id,
      productName: product.name,
      currentStock,
      avgDailySales: avgDailySales.toFixed(2),
      idealStock,
      suggestion: toBuy,
      status,
    };
  });

  // Retornar apenas onde há sugestão de compra ou estoque crítico
  return suggestions.filter((s: any) => s.suggestion > 0 || s.status === 'critical');
};
