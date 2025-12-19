import pool from '../db/index.js';

export const dynamicPricingService = {
  /**
   * Calcula o preço sugerido para um produto seminovo.
   * @param productId ID do produto
   * @returns Preço sugerido
   */
  async getSuggestedUsedProductPrice(productId: number): Promise<number | null> {
    const productRes = await pool.query(
      'SELECT p.acquisition_date, p.condition, p.created_at, pv.price as new_price FROM products p JOIN product_variations pv ON p.id = pv.product_id WHERE p.id = $1 AND p.is_used = TRUE LIMIT 1',
      [productId],
    );

    if (productRes.rows.length === 0) {
      return null; // Produto não encontrado ou não é seminovo
    }

    const product = productRes.rows[0];
    const acquisitionDate = product.acquisition_date
      ? new Date(product.acquisition_date)
      : new Date(product.created_at);
    const newPrice = parseFloat(product.new_price);
    const condition = product.condition;

    // Calcular tempo em estoque (em meses)
    const diffTime = Math.abs(Date.now() - acquisitionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const monthsInStock = diffDays / 30;

    let suggestedPrice = newPrice;

    // Ajuste baseado na condição
    switch (condition) {
      case 'Excelente':
        suggestedPrice *= 0.95; // 5% de desconto do preço de novo
        break;
      case 'Bom':
        suggestedPrice *= 0.8; // 20% de desconto
        break;
      case 'Regular':
        suggestedPrice *= 0.6; // 40% de desconto
        break;
      default:
        suggestedPrice *= 0.7; // Padrão para condição desconhecida
        break;
    }

    // Ajuste baseado no tempo em estoque
    if (monthsInStock > 0) {
      suggestedPrice *= 1 - monthsInStock * 0.05; // Desvalorização de 5% ao mês
    }

    // Limitar o preço mínimo para não ficar muito baixo
    suggestedPrice = Math.max(suggestedPrice, newPrice * 0.3); // Preço mínimo de 30% do preço de novo

    return parseFloat(suggestedPrice.toFixed(2));
  },
};
