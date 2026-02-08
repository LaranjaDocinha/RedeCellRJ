import { getPool } from '../db/index.js';

export async function getContributionMarginByCategory() {
  const pool = getPool();
  const query = `
    SELECT
      c.name AS category_name,
      SUM((si.unit_price - si.cost_price) * si.quantity) AS contribution_margin
    FROM
      sale_items si
    JOIN
      product_variations pv ON si.variation_id = pv.id
    JOIN
      products p ON pv.product_id = p.id
    JOIN
      categories c ON p.category_id = c.id
    GROUP BY
      c.name
    ORDER BY
      contribution_margin DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

export async function getBreakEvenPoint() {
  const pool = getPool();

  // Get total revenue and total variable costs from sales
  const salesDataQuery = `
    SELECT
      SUM(si.quantity * si.unit_price) AS total_revenue,
      SUM(si.quantity * si.cost_price) AS total_variable_costs
    FROM
      sale_items si
    JOIN
      sales s ON si.sale_id = s.id
    WHERE
      s.sale_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND s.sale_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  `;
  const { rows: salesData } = await pool.query(salesDataQuery);
  const totalRevenue = parseFloat(salesData[0]?.total_revenue || 0);
  const totalVariableCosts = parseFloat(salesData[0]?.total_variable_costs || 0);

  // Get fixed costs from settings
  const fixedCostsQuery = `
    SELECT value FROM settings WHERE key = 'monthly_fixed_costs';
  `;
  const { rows: fixedCostsData } = await pool.query(fixedCostsQuery);
  const fixedCosts = parseFloat(fixedCostsData[0]?.value || '5000'); // Default to 5000 if not set

  // Calculate contribution margin ratio
  const contributionMarginRatio =
    totalRevenue > 0 ? (totalRevenue - totalVariableCosts) / totalRevenue : 0;

  // Calculate break-even point
  const breakEvenPoint = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;

  // Calculate current profit
  const currentProfit = totalRevenue - totalVariableCosts - fixedCosts;

  return {
    totalRevenue,
    totalVariableCosts,
    fixedCosts,
    contributionMarginRatio,
    breakEvenPoint,
    currentProfit,
    // For the frontend display, we might also want to send
    // how much revenue has been made this month compared to breakEvenPoint
    revenueTowardsBreakEven: Math.min(totalRevenue, breakEvenPoint),
    percentageTowardsBreakEven: breakEvenPoint > 0 ? (totalRevenue / breakEvenPoint) * 100 : 0,
  };
}

export async function getCustomerLTV() {
  const pool = getPool();
  const query = `
    SELECT
      c.id AS customer_id,
      c.name AS customer_name,
      SUM(s.total_amount) AS lifetime_value
    FROM
      customers c
    JOIN
      sales s ON c.id = s.customer_id
    GROUP BY
      c.id, c.name
    ORDER BY
      lifetime_value DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

export async function getCustomerAcquisitionCost() {
  const pool = getPool();

  // Get total new customers this month
  const newCustomersQuery = `
    SELECT
      COUNT(id) AS new_customers_count
    FROM
      customers
    WHERE
      created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  `;
  const { rows: newCustomersData } = await pool.query(newCustomersQuery);
  const newCustomersCount = parseInt(newCustomersData[0]?.new_customers_count || 0, 10);

  // Get marketing expenses this month
  const marketingExpensesQuery = `
    SELECT
      SUM(amount) AS total_marketing_spend
    FROM
      expense_reimbursements
    WHERE
      LOWER(description) LIKE '%marketing%'
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  `;
  const { rows: marketingExpensesData } = await pool.query(marketingExpensesQuery);
  const totalMarketingSpend = parseFloat(marketingExpensesData[0]?.total_marketing_spend || 0);

  const cac = newCustomersCount > 0 ? totalMarketingSpend / newCustomersCount : 0;

  return {
    newCustomersCount,
    totalMarketingSpend,
    cac,
  };
}
