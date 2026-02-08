import pool from '../db/index.js';

// DRE Completo (Demonstrativo de Resultado do Exercício)
export const getDRE = async (startDate: string, endDate: string) => {
  // 1. Receita Bruta (Vendas + Serviços)
  const revenueRes = await pool.query(
    'SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM sales WHERE sale_date BETWEEN $1 AND $2',
    [startDate, endDate],
  );
  const grossRevenue = parseFloat(revenueRes.rows[0].total_revenue);

  // 2. Impostos (Simples Nacional - Est. 6%)
  const taxes = grossRevenue * 0.06;

  // 3. Receita Líquida
  const netRevenue = grossRevenue - taxes;

  // 4. CMV (Custo da Mercadoria Vendida)
  const cogsRes = await pool.query(
    `SELECT COALESCE(SUM(si.cost_price * si.quantity), 0) as total_cogs 
     FROM sale_items si 
     JOIN sales s ON si.sale_id = s.id 
     WHERE s.sale_date BETWEEN $1 AND $2`,
    [startDate, endDate],
  );
  const cogs = parseFloat(cogsRes.rows[0].total_cogs);

  // 5. Lucro Bruto
  const grossProfit = netRevenue - cogs;

  // 6. Despesas Operacionais
  const expensesRes = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total_expenses 
     FROM expense_reimbursements 
     WHERE status = 'approved' AND created_at BETWEEN $1 AND $2`,
    [startDate, endDate],
  );
  const expenses = parseFloat(expensesRes.rows[0].total_expenses);

  // 7. Comissões (Estimativa 3% geral)
  const commissions = grossRevenue * 0.03;

  // 8. Lucro Líquido
  const netProfit = grossProfit - expenses - commissions;

  return {
    grossRevenue,
    taxes,
    netRevenue,
    cogs,
    grossProfit,
    expenses,
    commissions,
    netProfit,
    margin: grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0,
  };
};

export const getSimplePLReport = getDRE; // Alias for backward compatibility

export const getCashFlowReport = async (startDate: string, endDate: string) => {
  const query = `
    SELECT 
      DATE(transaction_date) as date,
      SUM(CASE WHEN entry_type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM general_ledger
    WHERE transaction_date BETWEEN $1 AND $2
    GROUP BY DATE(transaction_date)
    ORDER BY date ASC;
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

export const getProductProfitabilityReport = async (startDate: string, endDate: string) => {
  const result = await pool.query(
    `SELECT 
      p.name AS product_name,
      pv.color AS variation_color,
      pv.storage_capacity,
      SUM(si.quantity) AS total_quantity_sold,
      SUM(si.unit_price * si.quantity) AS total_revenue,
      SUM(si.cost_price * si.quantity) AS total_cost_of_goods_sold,
      SUM((si.unit_price - si.cost_price) * si.quantity) AS gross_profit,
      (SUM((si.unit_price - si.cost_price) * si.quantity) / NULLIF(SUM(si.unit_price * si.quantity), 0)) * 100 AS gross_margin_percentage
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN product_variations pv ON si.variation_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE s.sale_date BETWEEN $1 AND $2
    GROUP BY p.name, pv.color, pv.storage_capacity
    ORDER BY gross_profit DESC;`,
    [startDate, endDate],
  );
  return result.rows.map((row) => ({
    ...row,
    total_quantity_sold: parseInt(row.total_quantity_sold),
    total_revenue: parseFloat(row.total_revenue),
    total_cost_of_goods_sold: parseFloat(row.total_cost_of_goods_sold),
    gross_profit: parseFloat(row.gross_profit),
    gross_margin_percentage: parseFloat(row.gross_margin_percentage || 0),
  }));
};
