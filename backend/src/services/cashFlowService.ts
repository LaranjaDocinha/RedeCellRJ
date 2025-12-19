import { getPool } from '../db/index.js';
import moment from 'moment';

export const getCashFlowData = async (
  branchId: number | undefined,
  startDate: string,
  endDate: string,
) => {
  const client = await getPool().connect();
  try {
    let salesQuery =
      'SELECT SUM(total_amount) as total_inflow FROM sales WHERE sale_date BETWEEN $1 AND $2';
    let expensesQuery =
      "SELECT SUM(amount) as total_outflow FROM expense_reimbursements WHERE status = 'approved' AND created_at BETWEEN $1 AND $2";
    let purchaseOrdersQuery =
      'SELECT SUM(total_amount) as total_po_outflow FROM purchase_orders WHERE created_at BETWEEN $1 AND $2';

    const queryParams = [startDate, endDate];
    let paramIndex = 3;

    if (branchId) {
      salesQuery += ` AND branch_id = $${paramIndex}`; // Assuming sales table has branch_id
      expensesQuery += ` AND branch_id = $${paramIndex}`; // Assuming expense_reimbursements has branch_id
      purchaseOrdersQuery += ` AND branch_id = $${paramIndex}`; // Assuming purchase_orders has branch_id
      queryParams.push(branchId.toString());
      paramIndex++;
    }

    const salesRes = await client.query(salesQuery, queryParams);
    const expensesRes = await client.query(expensesQuery, queryParams);
    const purchaseOrdersRes = await client.query(purchaseOrdersQuery, queryParams);

    const totalInflow = parseFloat(salesRes.rows[0].total_inflow) || 0;
    const totalOutflow =
      (parseFloat(expensesRes.rows[0].total_outflow) || 0) +
      (parseFloat(purchaseOrdersRes.rows[0].total_po_outflow) || 0);
    const netCashFlow = totalInflow - totalOutflow;

    // For detailed daily/monthly breakdown (example for daily)
    const dailyCashFlowQuery = `
        SELECT 
            DATE(sale_date) as date, 
            SUM(total_amount) as daily_inflow
        FROM sales
        WHERE sale_date BETWEEN $1 AND $2 ${branchId ? `AND branch_id = $${paramIndex - 1}` : ''}
        GROUP BY DATE(sale_date)
        ORDER BY date;
    `;
    const dailyInflows = await client.query(dailyCashFlowQuery, queryParams);

    const dailyExpensesQuery = `
        SELECT 
            DATE(created_at) as date, 
            SUM(amount) as daily_outflow
        FROM expense_reimbursements
        WHERE status = \'approved\' AND created_at BETWEEN $1 AND $2 ${branchId ? `AND branch_id = $${paramIndex - 1}` : ''}
        GROUP BY DATE(created_at)
        ORDER BY date;
    `;
    const dailyExpenses = await client.query(dailyExpensesQuery, queryParams);

    const dailyPurchaseOrdersQuery = `
        SELECT 
            DATE(created_at) as date, 
            SUM(total_amount) as daily_po_outflow
        FROM purchase_orders
        WHERE created_at BETWEEN $1 AND $2 ${branchId ? `AND branch_id = $${paramIndex - 1}` : ''}
        GROUP BY DATE(created_at)
        ORDER BY date;
    `;
    const dailyPurchaseOrders = await client.query(dailyPurchaseOrdersQuery, queryParams);

    const cashFlowTrend: { date: string; inflow: number; outflow: number }[] = [];
    const allDates = new Set<string>();

    dailyInflows.rows.forEach((row) => allDates.add(moment(row.date).format('YYYY-MM-DD')));
    dailyExpenses.rows.forEach((row) => allDates.add(moment(row.date).format('YYYY-MM-DD')));
    dailyPurchaseOrders.rows.forEach((row) => allDates.add(moment(row.date).format('YYYY-MM-DD')));

    Array.from(allDates)
      .sort()
      .forEach((date) => {
        const inflow =
          dailyInflows.rows.find((r) => moment(r.date).format('YYYY-MM-DD') === date)
            ?.daily_inflow || 0;
        const expense =
          dailyExpenses.rows.find((r) => moment(r.date).format('YYYY-MM-DD') === date)
            ?.daily_outflow || 0;
        const poOutflow =
          dailyPurchaseOrders.rows.find((r) => moment(r.date).format('YYYY-MM-DD') === date)
            ?.daily_po_outflow || 0;
        cashFlowTrend.push({
          date,
          inflow: parseFloat(inflow),
          outflow: parseFloat(expense) + parseFloat(poOutflow),
        });
      });

    return {
      totalInflow,
      totalOutflow,
      netCashFlow,
      cashFlowTrend,
    };
  } finally {
    client.release();
  }
};
