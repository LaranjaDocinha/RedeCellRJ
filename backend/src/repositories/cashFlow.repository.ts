import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface CashFlowSummary {
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
}

export interface DailyCashFlow {
  date: string;
  daily_inflow: number;
  daily_outflow: number;
}

export class CashFlowRepository {
  private get db(): Pool {
    return getPool();
  }

  async getSummary(
    branchId: number | undefined,
    startDate: string,
    endDate: string,
  ): Promise<CashFlowSummary> {
    const params = [startDate, endDate];
    let branchFilter = '';

    if (branchId) {
      branchFilter = `AND branch_id = $3`;
      params.push(branchId);
    }

    // Parallel queries for performance
    const [salesRes, expensesRes, purchaseOrdersRes] = await Promise.all([
      this.db.query(
        `SELECT SUM(total_amount) as total FROM sales WHERE sale_date BETWEEN $1 AND $2 ${branchFilter}`,
        params,
      ),
      this.db.query(
        `SELECT SUM(amount) as total FROM expense_reimbursements WHERE status = 'approved' AND created_at BETWEEN $1 AND $2 ${branchFilter}`,
        params,
      ),
      this.db.query(
        `SELECT SUM(total_amount) as total FROM purchase_orders WHERE created_at BETWEEN $1 AND $2 ${branchFilter}`,
        params,
      ),
    ]);

    const totalInflow = parseFloat(salesRes.rows[0].total) || 0;
    const totalOutflow =
      (parseFloat(expensesRes.rows[0].total) || 0) +
      (parseFloat(purchaseOrdersRes.rows[0].total) || 0);

    return { totalInflow, totalOutflow, netCashFlow: totalInflow - totalOutflow };
  }

  async getDailyBreakdown(
    branchId: number | undefined,
    startDate: string,
    endDate: string,
  ): Promise<{ inflows: any[]; expenses: any[]; purchases: any[] }> {
    const params = [startDate, endDate];
    let branchFilter = '';

    if (branchId) {
      branchFilter = `AND branch_id = $3`;
      params.push(branchId);
    }

    const [inflowsRes, expensesRes, purchasesRes] = await Promise.all([
      this.db.query(
        `
        SELECT DATE(sale_date) as date, SUM(total_amount) as amount 
        FROM sales WHERE sale_date BETWEEN $1 AND $2 ${branchFilter}
        GROUP BY DATE(sale_date) ORDER BY date`,
        params,
      ),
      this.db.query(
        `
        SELECT DATE(created_at) as date, SUM(amount) as amount 
        FROM expense_reimbursements WHERE status = 'approved' AND created_at BETWEEN $1 AND $2 ${branchFilter}
        GROUP BY DATE(created_at) ORDER BY date`,
        params,
      ),
      this.db.query(
        `
        SELECT DATE(created_at) as date, SUM(total_amount) as amount 
        FROM purchase_orders WHERE created_at BETWEEN $1 AND $2 ${branchFilter}
        GROUP BY DATE(created_at) ORDER BY date`,
        params,
      ),
    ]);

    return {
      inflows: inflowsRes.rows,
      expenses: expensesRes.rows,
      purchases: purchasesRes.rows,
    };
  }
}

export const cashFlowRepository = new CashFlowRepository();
