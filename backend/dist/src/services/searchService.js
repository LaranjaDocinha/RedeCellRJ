import { getPool } from '../db/index.js';
export const searchService = {
    // Upgraded to PostgreSQL Full-Text Search
    async performSearch(query, entityType) {
        const pool = getPool();
        const results = {};
        const searchPromises = [];
        // Product Search
        if (!entityType || entityType === 'products' || entityType === 'all') {
            searchPromises.push(pool.query(`
        SELECT id, name,
               ts_rank(to_tsvector('portuguese', name || ' ' || coalesce(description, '') || ' ' || coalesce(sku, '')), plainto_tsquery('portuguese', $1)) as rank
        FROM products
        WHERE to_tsvector('portuguese', name || ' ' || coalesce(description, '') || ' ' || coalesce(sku, '')) @@ plainto_tsquery('portuguese', $1)
        ORDER BY rank DESC
        LIMIT 5
      `, [query]).then(res => results.products = res.rows));
        }
        // Customer Search
        if (!entityType || entityType === 'customers' || entityType === 'all') {
            searchPromises.push(pool.query(`
        SELECT id, name,
               ts_rank(to_tsvector('portuguese', name || ' ' || coalesce(email, '')), plainto_tsquery('portuguese', $1)) as rank
        FROM customers
        WHERE to_tsvector('portuguese', name || ' ' || coalesce(email, '')) @@ plainto_tsquery('portuguese', $1)
        ORDER BY rank DESC
        LIMIT 5
      `, [query]).then(res => results.customers = res.rows));
        }
        await Promise.all(searchPromises);
        return results;
    },
    async getSuggestions(query, entityType) {
        const pool = getPool();
        const suggestions = [];
        const lowerCaseQuery = `%${query.toLowerCase()}%`;
        const suggestionPromises = [];
        if (!entityType || entityType === 'products' || entityType === 'all') {
            suggestionPromises.push(pool.query(`
        SELECT name FROM products
        WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1 OR LOWER(sku) LIKE $1
        LIMIT 5
      `, [lowerCaseQuery]).then(res => res.rows.forEach(row => suggestions.push(row.name))));
        }
        if (!entityType || entityType === 'customers' || entityType === 'all') {
            suggestionPromises.push(pool.query(`
        SELECT name FROM customers
        WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1
        LIMIT 5
      `, [lowerCaseQuery]).then(res => res.rows.forEach(row => suggestions.push(row.name))));
        }
        await Promise.all(suggestionPromises);
        // Remover duplicatas e limitar o número total de sugestões
        const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 10);
        return uniqueSuggestions;
    },
};
