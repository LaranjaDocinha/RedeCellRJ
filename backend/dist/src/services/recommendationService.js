import pool from '../db/index.js';
// Esquemas de validação (se necessário para novas funções)
// ...
// This service would be called after a sale is completed
export const updateProductCorrelations = async (productIds) => {
    if (productIds.length < 2)
        return;
    for (let i = 0; i < productIds.length; i++) {
        for (let j = i + 1; j < productIds.length; j++) {
            const id1 = Math.min(productIds[i], productIds[j]);
            const id2 = Math.max(productIds[i], productIds[j]);
            await pool.query(`
        INSERT INTO product_correlations (product_a_id, product_b_id, purchase_count)
        VALUES ($1, $2, 1)
        ON CONFLICT (product_a_id, product_b_id)
        DO UPDATE SET purchase_count = product_correlations.purchase_count + 1;
      `, [id1, id2]);
        }
    }
};
export const getProductRecommendations = async (productId, customerId) => {
    let query = `
    SELECT p.*, pc.purchase_count
    FROM product_correlations pc
    JOIN products p ON p.id = (CASE WHEN pc.product_a_id = $1 THEN pc.product_b_id ELSE pc.product_a_id END)
    WHERE (pc.product_a_id = $1 OR pc.product_b_id = $1)
  `;
    const queryParams = [productId];
    // Lógica para upselling e cross-selling mais avançada
    // Exemplo: Se o cliente comprou um celular, sugerir acessórios (cross-selling)
    // ou um modelo de celular mais novo (upselling)
    if (customerId) {
        // Buscar histórico de compras do cliente
        const customerHistoryRes = await pool.query('SELECT DISTINCT si.product_id FROM sales s JOIN sale_items si ON s.id = si.sale_id WHERE s.customer_id = $1', [customerId]);
        const customerProductIds = customerHistoryRes.rows.map((row) => row.product_id);
        if (customerProductIds.length > 0) {
            // Adicionar lógica para filtrar recomendações baseadas no histórico do cliente
            // Por exemplo, evitar recomendar produtos que o cliente já comprou recentemente
            // Ou priorizar produtos de categorias que o cliente compra frequentemente
            // Isso pode ser feito adicionando mais JOINs e WHERE clauses à query principal
        }
    }
    query += `
    ORDER BY pc.purchase_count DESC
    LIMIT 5;
  `;
    const result = await pool.query(query, queryParams);
    return result.rows;
};
// Nova função para obter recomendações personalizadas para um cliente
export const getPersonalizedRecommendations = async (customerId) => {
    const query = `
    WITH customer_purchased_categories AS (
      SELECT c.id as category_id, c.name as category_name, COUNT(*) as purchase_count
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.customer_id = $1
      GROUP BY c.id, c.name
      ORDER BY purchase_count DESC
      LIMIT 3
    ),
    popular_products_in_categories AS (
      SELECT p.id as product_id, p.name as product_name, p.category_id, ROW_NUMBER() OVER(PARTITION BY p.category_id ORDER BY COUNT(si.product_id) DESC) as rn
      FROM products p
      JOIN sale_items si ON p.id = si.product_id
      WHERE p.category_id IN (SELECT category_id FROM customer_purchased_categories)
      GROUP BY p.id, p.name, p.category_id
    ),
    customer_purchased_products AS (
      SELECT DISTINCT product_id FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.customer_id = $1
    )
    SELECT ppic.product_id, ppic.product_name
    FROM popular_products_in_categories ppic
    WHERE ppic.rn <= 5 AND ppic.product_id NOT IN (SELECT product_id FROM customer_purchased_products)
    LIMIT 10;
  `;
    const result = await pool.query(query, [customerId]);
    return result.rows;
};
