import { getPool } from '../db/index.js';

export const calculateBreakEvenPoint = async (
  branchId: number | undefined,
  startDate: string,
  endDate: string,
) => {
  const client = await getPool().connect();
  try {
    // 1. Calculate Total Fixed Costs (simplified - in a real app, this would be more complex)
    // For now, let's assume some fixed costs from expense reimbursements and a dummy value
    let fixedCostsQuery = `
      SELECT SUM(amount) as total_fixed_expenses
      FROM expense_reimbursements
      WHERE status = 'approved' AND created_at BETWEEN $1 AND $2
    `;
    const fixedCostsParams = [startDate, endDate];
    let fixedCostsParamIndex = 3;
    if (branchId) {
      fixedCostsQuery += ` AND branch_id = $${fixedCostsParamIndex++}`;
      fixedCostsParams.push(branchId.toString());
    }
    const fixedCostsRes = await client.query(fixedCostsQuery, fixedCostsParams);
    const totalFixedCosts = parseFloat(fixedCostsRes.rows[0].total_fixed_expenses || 0) + 5000; // Dummy fixed cost for rent/salaries

    // 2. Calculate Total Revenue and Total Variable Costs (COGS)
    let salesDataQuery = `
      SELECT
        SUM(si.total_price) as total_revenue,
        SUM(si.cost_price * si.quantity) as total_variable_costs,
        SUM(si.quantity) as total_units_sold
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date BETWEEN $1 AND $2
    `;
    const salesDataParams = [startDate, endDate];
    let salesDataParamIndex = 3;
    if (branchId) {
      salesDataQuery += ` AND s.branch_id = $${salesDataParamIndex++}`;
      salesDataParams.push(branchId.toString());
    }
    const salesDataRes = await client.query(salesDataQuery, salesDataParams);
    const totalRevenue = parseFloat(salesDataRes.rows[0].total_revenue || 0);
    const totalVariableCosts = parseFloat(salesDataRes.rows[0].total_variable_costs || 0);
    const totalUnitsSold = parseFloat(salesDataRes.rows[0].total_units_sold || 0);

    // Calculate average selling price and average variable cost per unit
    const averageSellingPrice = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0;
    const averageVariableCostPerUnit = totalUnitsSold > 0 ? totalVariableCosts / totalUnitsSold : 0;

    // Calculate Contribution Margin per Unit
    const contributionMarginPerUnit = averageSellingPrice - averageVariableCostPerUnit;

    // Calculate Break-even Point in Units
    const breakEvenUnits =
      contributionMarginPerUnit > 0 ? totalFixedCosts / contributionMarginPerUnit : 0;

    // Calculate Break-even Point in Revenue
    const contributionMarginRatio =
      totalRevenue > 0 ? (totalRevenue - totalVariableCosts) / totalRevenue : 0;
    const breakEvenRevenue =
      contributionMarginRatio > 0 ? totalFixedCosts / contributionMarginRatio : 0;

    return {
      totalFixedCosts: parseFloat(totalFixedCosts.toFixed(2)),
      totalVariableCosts: parseFloat(totalVariableCosts.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalUnitsSold: parseFloat(totalUnitsSold.toFixed(2)),
      averageSellingPrice: parseFloat(averageSellingPrice.toFixed(2)),
      averageVariableCostPerUnit: parseFloat(averageVariableCostPerUnit.toFixed(2)),
      contributionMarginPerUnit: parseFloat(contributionMarginPerUnit.toFixed(2)),
      breakEvenUnits: parseFloat(breakEvenUnits.toFixed(2)),
      breakEvenRevenue: parseFloat(breakEvenRevenue.toFixed(2)),
    };
  } finally {
    client.release();
  }
};
