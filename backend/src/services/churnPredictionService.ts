import pool from '../db/index.js';

interface ChurnRisk {
  customerId: number;
  customerName: string;
  riskScore: number; // 0-100
  status: 'low' | 'medium' | 'high';
  reason: string[];
}

export const getChurnRisk = async (customerId: number): Promise<ChurnRisk | null> => {
  const customerRes = await pool.query(
    'SELECT name, email FROM customers WHERE id = $1',
    [customerId]
  );
  if (customerRes.rows.length === 0) return null;
  const customer = customerRes.rows[0];

  // Regras de Churn Simplificadas:
  // 1. Inatividade (sem compras nos últimos 60 dias)
  // 2. Número baixo de compras (menos de 2 nos últimos 90 dias)
  // 3. Reclamações recentes (simulado por score baixo ou histórico de suporte)

  let riskScore = 0;
  const reasons: string[] = [];

  // Inatividade
  const lastPurchaseRes = await pool.query(
    'SELECT MAX(sale_date) as last_sale FROM sales WHERE customer_id = $1',
    [customerId]
  );
  const lastSaleDate: Date | null = lastPurchaseRes.rows[0]?.last_sale;
  if (lastSaleDate) {
    const daysSinceLastSale = (new Date().getTime() - lastSaleDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSale > 60) {
      riskScore += 40;
      reasons.push(`Inatividade: Sem compras há ${Math.floor(daysSinceLastSale)} dias.`);
    } else if (daysSinceLastSale > 30) {
      riskScore += 10;
      reasons.push(`Baixa atividade: Última compra há ${Math.floor(daysSinceLastSale)} dias.`);
    }
  } else {
    // Cliente nunca comprou? Alto risco.
    riskScore += 50;
    reasons.push('Cliente sem histórico de compras.');
  }

  // Baixo número de compras
  const purchaseCountRes = await pool.query(
    'SELECT COUNT(id) FROM sales WHERE customer_id = $1 AND sale_date >= NOW() - INTERVAL \'90 days\'',
    [customerId]
  );
  const purchaseCount = parseInt(purchaseCountRes.rows[0].count, 10);
  if (purchaseCount < 2 && lastSaleDate) { // Se tiver histórico, mas poucas compras
    riskScore += 30;
    reasons.push(`Baixo volume de compras: Apenas ${purchaseCount} nos últimos 90 dias.`);
  }

  // Classificação de risco
  let status: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 70) status = 'high';
  else if (riskScore >= 40) status = 'medium';

  return {
    customerId,
    customerName: customer.name,
    riskScore: Math.min(riskScore, 100), // Max 100
    status,
    reason: reasons.length > 0 ? reasons : ['Atividade regular.']
  };
};

export const getCustomersWithHighChurnRisk = async () => {
  const result = await pool.query(`
    SELECT c.id, c.name, MAX(s.sale_date) as last_sale, COUNT(s.id) as total_sales_90d
    FROM customers c
    LEFT JOIN sales s ON c.id = s.customer_id AND s.sale_date >= NOW() - INTERVAL '90 days'
    GROUP BY c.id, c.name
    HAVING MAX(s.sale_date) < NOW() - INTERVAL '60 days' OR COUNT(s.id) < 2
    ORDER BY last_sale ASC NULLS FIRST
    LIMIT 10;
  `);

  const churnRisks: ChurnRisk[] = [];
  for (const row of result.rows) {
    const risk = await getChurnRisk(row.id);
    if (risk && risk.riskScore > 40) { // Filter for medium/high risk
      churnRisks.push(risk);
    }
  }
  return churnRisks;
};
