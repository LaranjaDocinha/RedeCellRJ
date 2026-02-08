import { getPool } from '../db/index.js';

export const getCartUpsellRecommendations = async (productIds: number[]): Promise<any[]> => {
  if (productIds.length === 0) return [];

  const { rows } = await getPool().query(
    `
      SELECT 
        p.id, p.name, pv.price, COUNT(*) as frequency
      FROM sale_items si1
      JOIN sale_items si2 ON si1.sale_id = si2.sale_id AND si1.product_id != si2.product_id
      JOIN products p ON si2.product_id = p.id
      JOIN product_variations pv ON p.id = pv.product_id
      WHERE si1.product_id = ANY($1::int[])
      GROUP BY p.id, p.name, pv.price
      ORDER BY frequency DESC
      LIMIT 3;
    `,
    [productIds],
  );

  return rows;
};

// Placeholder for other methods to avoid breaking existing routes immediately
export const getProductRecommendations = async (_id: number) => [];
export const getPersonalizedRecommendations = async (_id: number) => [];
export const getCollaborativeRecommendations = async (_ids: number[]) => [];
