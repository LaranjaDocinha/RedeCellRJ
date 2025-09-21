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
export const dashboardService = {
    getTotalSalesAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield pool.query('SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales;');
            return parseFloat(rows[0].total_sales);
        });
    },
    getSalesByMonth() {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield pool.query(`SELECT
        TO_CHAR(sale_date, 'YYYY-MM') AS month,
        COALESCE(SUM(total_amount), 0) AS monthly_sales
      FROM sales
      GROUP BY month
      ORDER BY month ASC;`);
            return rows.map(row => ({ month: row.month, monthly_sales: parseFloat(row.monthly_sales) }));
        });
    },
    getTopSellingProducts() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            const { rows } = yield pool.query(`SELECT
        p.name AS product_name,
        pv.color AS variation_color,
        SUM(si.quantity) AS total_quantity_sold
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      GROUP BY p.name, pv.color
      ORDER BY total_quantity_sold DESC
      LIMIT $1;`, [limit]);
            return rows.map(row => (Object.assign(Object.assign({}, row), { total_quantity_sold: parseInt(row.total_quantity_sold) })));
        });
    },
};
