import pool from '../db/index.js';

// TODO: Upgrade to PostgreSQL Full-Text Search for better performance and relevance.
export const performSearch = async (query: string) => {
  const searchQuery = `%${query}%`;

  // Search for products and customers in parallel
  const productsPromise = pool.query(
    'SELECT id, name FROM products WHERE name ILIKE $1 LIMIT 5',
    [searchQuery]
  );

  const customersPromise = pool.query(
    'SELECT id, name FROM users WHERE name ILIKE $1 LIMIT 5',
    [searchQuery]
  );

  const [productsResult, customersResult] = await Promise.all([
    productsPromise,
    customersPromise,
  ]);

  return {
    products: productsResult.rows,
    customers: customersResult.rows,
  };
};