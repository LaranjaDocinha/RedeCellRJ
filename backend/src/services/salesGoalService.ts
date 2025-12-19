import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface SalesGoal {
  id: number;
  user_id?: string;
  branch_id?: number;
  start_date: Date;
  end_date: Date;
  target_amount: number;
  target_quantity: number;
  created_at: Date;
  updated_at: Date;
}

interface SalesGoalProgress {
  goalId?: number;
  goalName: string;
  targetAmount: number;
  targetQuantity: number;
  currentSalesAmount: number;
  currentSalesQuantity: number;
  progressPercentageAmount: number;
  progressPercentageQuantity: number;
  remainingAmount: number;
  remainingQuantity: number;
  isAchievedAmount: boolean;
  isAchievedQuantity: boolean;
}

class SalesGoalService {
  async getSalesGoalProgress(options: { userId?: string, branchId?: number }): Promise<SalesGoalProgress | null> {
    const { userId, branchId } = options;
    const pool = getPool();
    const today = new Date();

    let goalQuery = `SELECT * FROM sales_goals WHERE start_date <= $1 AND end_date >= $1`;
    const queryParams: any[] = [today];
    let paramIndex = 2;

    if (userId) {
      goalQuery += ` AND user_id = $${paramIndex++}`;
      queryParams.push(userId);
    } else if (branchId) {
      goalQuery += ` AND branch_id = $${paramIndex++}`;
      queryParams.push(branchId);
    } else {
      return null; // Must specify user or branch
    }

    const goalRes = await pool.query(goalQuery, queryParams);
    const goal: SalesGoal = goalRes.rows[0];

    if (!goal) {
      return null; // No active goal found
    }

    // Calculate current sales for the goal period
    let salesQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) AS current_sales_amount,
        COALESCE(SUM(si.quantity), 0) AS current_sales_quantity
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      WHERE s.sale_date >= $1 AND s.sale_date <= $2
    `;
    const salesQueryParams: any[] = [goal.start_date, goal.end_date];
    paramIndex = 3;

    if (userId) {
      salesQuery += ` AND s.user_id = $${paramIndex++}`;
      salesQueryParams.push(userId);
    } else if (branchId) {
      salesQuery += ` AND s.branch_id = $${paramIndex++}`;
      salesQueryParams.push(branchId);
    }

    const currentSalesRes = await pool.query(salesQuery, salesQueryParams);
    const currentSales = currentSalesRes.rows[0];

    const currentSalesAmount = parseFloat(currentSales.current_sales_amount);
    const currentSalesQuantity = parseInt(currentSales.current_sales_quantity, 10);

    const progressPercentageAmount = goal.target_amount > 0 ? (currentSalesAmount / goal.target_amount) * 100 : 0;
    const progressPercentageQuantity = goal.target_quantity > 0 ? (currentSalesQuantity / goal.target_quantity) * 100 : 0;

    const remainingAmount = goal.target_amount - currentSalesAmount;
    const remainingQuantity = goal.target_quantity - currentSalesQuantity;

    return {
      goalId: goal.id,
      goalName: goal.user_id ? `Meta de Vendas (${goal.user_id})` : `Meta de Filial (${goal.branch_id})`,
      targetAmount: parseFloat(goal.target_amount),
      targetQuantity: parseInt(goal.target_quantity, 10),
      currentSalesAmount,
      currentSalesQuantity,
      progressPercentageAmount: Math.min(100, progressPercentageAmount),
      progressPercentageQuantity: Math.min(100, progressPercentageQuantity),
      remainingAmount: Math.max(0, remainingAmount),
      remainingQuantity: Math.max(0, remainingQuantity),
      isAchievedAmount: currentSalesAmount >= goal.target_amount,
      isAchievedQuantity: currentSalesQuantity >= goal.target_quantity,
    };
  }
}

export const salesGoalService = new SalesGoalService();
