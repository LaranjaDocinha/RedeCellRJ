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
export const reportService = {
    getSalesByDate(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `
      SELECT
        DATE(sale_date) as sale_date,
        SUM(total_amount) as daily_sales
      FROM sales
    `;
            const params = [];
            let paramIndex = 1;
            if (startDate && endDate) {
                query += ` WHERE sale_date >= $${paramIndex++} AND sale_date <= $${paramIndex++}`;
                params.push(startDate, endDate);
            }
            else if (startDate) {
                query += ` WHERE sale_date >= $${paramIndex++}`;
                params.push(startDate);
            }
            else if (endDate) {
                query += ` WHERE sale_date <= $${paramIndex++}`;
                params.push(endDate);
            }
            query += ` GROUP BY DATE(sale_date) ORDER BY sale_date ASC`;
            const { rows } = yield pool.query(query, params);
            return rows;
        });
    },
    getSalesByProduct(startDate, endDate, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `
      SELECT
        p.name as product_name,
        pv.color,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.price_at_sale * si.quantity) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN sales s ON si.sale_id = s.id
    `;
            const params = [];
            let paramIndex = 1;
            const conditions = [];
            if (startDate) {
                conditions.push(`s.sale_date >= $${paramIndex++}`);
                params.push(startDate);
            }
            if (endDate) {
                conditions.push(`s.sale_date <= $${paramIndex++}`);
                params.push(endDate);
            }
            if (productId) {
                conditions.push(`si.product_id = $${paramIndex++}`);
                params.push(productId);
            }
            if (conditions.length > 0) {
                query += ` WHERE ` + conditions.join(` AND `);
            }
            query += ` GROUP BY p.name, pv.color ORDER BY total_revenue DESC`;
            const { rows } = yield pool.query(query, params);
            return rows;
        });
    },
    getSalesByCustomer(startDate, endDate, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `
      SELECT
        u.name as customer_name,
        u.email as customer_email,
        SUM(s.total_amount) as total_spent,
        COUNT(s.id) as total_sales_count
      FROM sales s
      JOIN users u ON s.user_id = u.id
    `;
            const params = [];
            let paramIndex = 1;
            const conditions = [];
            if (startDate) {
                conditions.push(`s.sale_date >= $${paramIndex++}`);
                params.push(startDate);
            }
            if (endDate) {
                conditions.push(`s.sale_date <= $${paramIndex++}`);
                params.push(endDate);
            }
            if (customerId) {
                conditions.push(`s.user_id = $${paramIndex++}`);
                params.push(customerId);
            }
            if (conditions.length > 0) {
                query += ` WHERE ` + conditions.join(` AND `);
            }
            query += ` GROUP BY u.name, u.email ORDER BY total_spent DESC`;
            const { rows } = yield pool.query(query, params);
            return rows;
        });
    },
};
