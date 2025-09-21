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
// TODO: Upgrade to PostgreSQL Full-Text Search for better performance and relevance.
export const performSearch = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchQuery = `%${query}%`;
    // Search for products and customers in parallel
    const productsPromise = pool.query('SELECT id, name FROM products WHERE name ILIKE $1 LIMIT 5', [searchQuery]);
    const customersPromise = pool.query('SELECT id, name FROM users WHERE name ILIKE $1 LIMIT 5', [searchQuery]);
    const [productsResult, customersResult] = yield Promise.all([
        productsPromise,
        customersPromise,
    ]);
    return {
        products: productsResult.rows,
        customers: customersResult.rows,
    };
});
