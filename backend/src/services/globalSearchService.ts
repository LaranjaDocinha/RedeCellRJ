import pool from '../db/index.js';
import { QueryResult } from 'pg';

interface SearchResult {
  type: string;
  id: string;
  name: string;
  description?: string;
  email?: string;
}

interface ProductRow {
  id: string;
  name: string;
  description: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const searchTerm = `%${query.toLowerCase()}%`;

  // Search in Products
  const products = (await pool.query(
    `SELECT id, name, description FROM products WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 5`,
    [searchTerm],
  )) as QueryResult<ProductRow>;
  products.rows.forEach((row) =>
    results.push({ type: 'product', id: row.id, name: row.name, description: row.description }),
  );

  // Search in Users
  const users = (await pool.query(
    `SELECT id, name, email FROM users WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1 LIMIT 5`,
    [searchTerm],
  )) as QueryResult<UserRow>;
  users.rows.forEach((row) =>
    results.push({ type: 'user', id: row.id, name: row.name, email: row.email }),
  );

  // Add more entities as needed (e.g., sales, categories)

  return results;
}
