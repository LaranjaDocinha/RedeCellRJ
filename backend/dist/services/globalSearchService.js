var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from '../db/index.js';
export function globalSearch(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        const searchTerm = `%${query.toLowerCase()}%`;
        // Search in Products
        const products = yield pool.query(`SELECT id, name, description FROM products WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 5`, [searchTerm]);
        products.rows.forEach(row => results.push({ type: 'product', id: row.id, name: row.name, description: row.description }));
        // Search in Users
        const users = yield pool.query(`SELECT id, name, email FROM users WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1 LIMIT 5`, [searchTerm]);
        users.rows.forEach(row => results.push({ type: 'user', id: row.id, name: row.name, email: row.email }));
        // Add more entities as needed (e.g., sales, categories)
        return results;
    });
}
