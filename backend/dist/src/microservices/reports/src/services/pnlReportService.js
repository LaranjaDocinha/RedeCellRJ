"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../db.js");
class PnlReportService {
    async generatePnlReport(startDate, endDate) {
        const pool = (0, db_js_1.getPool)();
        const revenueQuery = `
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales
      WHERE sale_date BETWEEN $1 AND $2;
    `;
        const cogsQuery = `
      SELECT COALESCE(SUM(si.quantity * si.cost_price), 0) as total_cogs
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date BETWEEN $1 AND $2;
    `;
        const expensesQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expense_reimbursements
      WHERE status = 'approved' AND review_date BETWEEN $1 AND $2;
    `;
        const [revenueRes, cogsRes, expensesRes] = await Promise.all([
            pool.query(revenueQuery, [startDate, endDate]),
            pool.query(cogsQuery, [startDate, endDate]),
            pool.query(expensesQuery, [startDate, endDate]),
        ]);
        const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue);
        const totalCogs = parseFloat(cogsRes.rows[0].total_cogs);
        const totalExpenses = parseFloat(expensesRes.rows[0].total_expenses);
        const grossProfit = totalRevenue - totalCogs;
        const netProfit = grossProfit - totalExpenses;
        return {
            totalRevenue,
            totalCogs,
            grossProfit,
            totalExpenses,
            netProfit,
            startDate,
            endDate,
        };
    }
}
exports.default = new PnlReportService();
