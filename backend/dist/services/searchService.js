import { getPool } from '../db/index.js';
// Upgraded to PostgreSQL Full-Text Search
export const performSearch = async (query) => {
    const pool = getPool();
    // Use plainto_tsquery which handles natural language input well.
    // Searching name, description, and sku for products.
    // Searching name and email for customers.
    // Product Search
    const productsPromise = pool.query(`
    SELECT id, name, 
           ts_rank(to_tsvector('portuguese', name || ' ' || coalesce(description, '') || ' ' || coalesce(sku, '')), plainto_tsquery('portuguese', $1)) as rank
    FROM products 
    WHERE to_tsvector('portuguese', name || ' ' || coalesce(description, '') || ' ' || coalesce(sku, '')) @@ plainto_tsquery('portuguese', $1)
    ORDER BY rank DESC 
    LIMIT 5
  `, [query]);
    // Customer Search
    const customersPromise = pool.query(`
    SELECT id, name,
           ts_rank(to_tsvector('portuguese', name || ' ' || coalesce(email, '')), plainto_tsquery('portuguese', $1)) as rank
    FROM customers 
    WHERE to_tsvector('portuguese', name || ' ' || coalesce(email, '')) @@ plainto_tsquery('portuguese', $1)
    ORDER BY rank DESC
    LIMIT 5
  `, [query]);
    const [productsResult, customersResult] = await Promise.all([productsPromise, customersPromise]);
    return {
        products: productsResult.rows,
        customers: customersResult.rows,
    };
};
