import { getPool } from '../db/index.js';
class SalesGoalService {
    /**
     * Retrieves sales goals and current sales performance for a given period.
     * For simplicity, a fixed daily target is used, and current sales are aggregated for the current day.
     */
    async getCurrentDailySalesGoal(branchId) {
        const pool = getPool();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // End of today
        // For now, a fixed target. In a real system, this would come from a 'sales_goals' table.
        const targetAmount = 1000; // Example daily sales target
        // Current sales for today
        const salesRes = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS current_sales_amount
       FROM sales
       WHERE sale_date BETWEEN $1 AND $2 AND branch_id = $3`, [today, endOfToday, branchId]);
        const currentSalesAmount = parseFloat(salesRes.rows[0].current_sales_amount);
        const progressPercentage = targetAmount > 0 ? (currentSalesAmount / targetAmount) * 100 : 0;
        const remainingAmount = targetAmount - currentSalesAmount;
        return {
            targetAmount,
            currentSalesAmount,
            progressPercentage: Math.min(100, progressPercentage), // Cap at 100%
            remainingAmount: Math.max(0, remainingAmount), // Don't go below 0
        };
    }
}
export const salesGoalService = new SalesGoalService();
