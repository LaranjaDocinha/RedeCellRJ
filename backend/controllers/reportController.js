const db = require('../db');
const { AppError } = require('../utils/appError');

// @desc    Gerar relatório de vendas
// @route   GET /api/reports/sales
// @access  Private
const getSalesReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const query = `
      SELECT
        s.id as sale_id,
        s.sale_date,
        s.total_amount,
        s.payment_method,
        u.name as user_name,
        c.name as customer_name,
        si.product_name,
        si.quantity,
        si.price_at_sale,
        si.cost_at_sale
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      JOIN sale_items si ON s.id = si.sale_id
      WHERE s.sale_date BETWEEN $1 AND $2
      ORDER BY s.sale_date DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de estoque
// @route   GET /api/reports/inventory
// @access  Private
const getInventoryReport = async (req, res) => {
  try {
    const query = `
      SELECT
        p.name as product_name,
        pv.barcode,
        pv.stock_quantity,
        pv.min_stock_level,
        pv.price,
        pv.cost,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de lucratividade
// @route   GET /api/reports/profitability
// @access  Private
const getProfitabilityReport = async (req, res) => {
  const { startDate, endDate, productId, categoryId } = req.query;
  try {
    let query = `
      SELECT
        si.product_id,
        si.product_name,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.quantity * si.price_at_sale) as total_revenue,
        SUM(si.quantity * si.cost_at_sale) as total_cost,
        (SUM(si.quantity * si.price_at_sale) - SUM(si.quantity * si.cost_at_sale)) as gross_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN product_variations pv ON si.product_id = pv.id -- Assuming product_id in sale_items refers to product_variations.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.sale_date BETWEEN $1 AND $2
    `;
    const queryParams = [startDate, endDate];
    let paramIndex = 3;

    if (productId) {
      query += ` AND p.id = ${paramIndex++}`;
      queryParams.push(productId);
    }
    if (categoryId) {
      query += ` AND p.category_id = ${paramIndex++}`;
      queryParams.push(categoryId);
    }

    query += ` GROUP BY si.product_id, si.product_name ORDER BY gross_profit DESC;`;

    const { rows } = await db.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de lucratividade:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar exportação contábil (CSV)
// @route   GET /api/reports/accounting-export
// @access  Private
const getAccountingExport = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    // Exemplo: Exportar vendas e despesas
    const sales = await db.query(
      `SELECT sale_date as date, total_amount as amount, 'Receita' as type, payment_method as details FROM sales WHERE sale_date BETWEEN $1 AND $2 ORDER BY sale_date ASC;`,
      [startDate, endDate]
    );
    const expenses = await db.query(
      `SELECT expense_date as date, amount, 'Despesa' as type, category as details FROM expenses WHERE expense_date BETWEEN $1 AND $2 ORDER BY expense_date ASC;`,
      [startDate, endDate]
    );

    const allTransactions = [...sales.rows, ...expenses.rows];

    // Ordenar por data
    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const fields = [
      { label: 'Data', value: 'date' },
      { label: 'Tipo', value: 'type' },
      { label: 'Valor', value: 'amount' },
      { label: 'Detalhes', value: 'details' },
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(allTransactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('accounting_export.csv');
    res.send(csv);

  } catch (error) {
    console.error('Erro ao gerar exportação contábil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de vendas por categoria
// @route   GET /api/reports/sales-by-category
// @access  Private
const getSalesByCategoryReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const query = `
      SELECT
        c.name as category_name,
        SUM(si.quantity * si.unit_price) as total_sales_amount
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY c.name
      ORDER BY total_sales_amount DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas por categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de produtos com estoque baixo
// @route   GET /api/reports/low-stock-products
// @access  Private
const getLowStockProductsReport = async (req, res) => {
  try {
    const query = `
      SELECT
        p.name as product_name,
        pv.barcode,
        pv.stock_quantity,
        pv.min_stock_level,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE pv.stock_quantity <= pv.min_stock_level
      ORDER BY pv.stock_quantity ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos com estoque baixo:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de desempenho por técnico
// @route   GET /api/reports/technician-performance
// @access  Private
const getTechnicianPerformanceReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Data de início e data de fim são obrigatórias.' });
  }

  try {
    const query = `
      SELECT
        t.id AS technician_id,
        t.name AS technician_name,
        COUNT(r.id) AS total_repairs,
        COALESCE(SUM(r.final_cost), 0) AS total_revenue,
        COALESCE(AVG(EXTRACT(EPOCH FROM (r.actual_completion_date - r.created_at))) / 60, 0) AS average_repair_time_minutes
      FROM
        technicians t
      LEFT JOIN
        repairs r ON t.id = r.technician_id
      WHERE
        r.created_at BETWEEN $1 AND $2
        AND r.status IN ('Finalizado', 'Entregue')
      GROUP BY
        t.id, t.name
      ORDER BY
        total_revenue DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);

    res.json(rows);

  } catch (error) {
    console.error('Erro ao gerar relatório de desempenho por técnico:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar análise ABC de produtos
// @route   GET /api/reports/abc-products
// @access  Private
const getAbcProductAnalysis = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Datas de início e fim são obrigatórias.' });
  }

  try {
    const query = `
      SELECT
        p.id as product_id,
        p.name as product_name,
        SUM(si.quantity * si.price_at_sale) as total_revenue
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.product_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY p.id, p.name
      ORDER BY total_revenue DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);

    let cumulativeRevenue = 0;
    const totalOverallRevenue = rows.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0);

    const abcAnalysis = rows.map(row => {
      cumulativeRevenue += parseFloat(row.total_revenue);
      const cumulativePercentage = (cumulativeRevenue / totalOverallRevenue) * 100;
      let category = 'C';
      if (cumulativePercentage <= 80) {
        category = 'A';
      } else if (cumulativePercentage <= 95) {
        category = 'B';
      }
      return { ...row, cumulative_revenue: parseFloat(cumulativeRevenue.toFixed(2)), cumulative_percentage: parseFloat(cumulativePercentage.toFixed(2)), category };
    });

    res.json(abcAnalysis);
  } catch (error) {
    console.error('Erro ao gerar análise ABC de produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar análise ABC de clientes
// @route   GET /api/reports/abc-customers
// @access  Private
const getAbcCustomerAnalysis = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Datas de início e fim são obrigatórias.' });
  }

  try {
    const query = `
      SELECT
        c.id as customer_id,
        c.name as customer_name,
        SUM(s.total_amount) as total_purchase_amount
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY c.id, c.name
      ORDER BY total_purchase_amount DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);

    let cumulativePurchaseAmount = 0;
    const totalOverallPurchaseAmount = rows.reduce((sum, row) => sum + parseFloat(row.total_purchase_amount), 0);

    const abcAnalysis = rows.map(row => {
      cumulativePurchaseAmount += parseFloat(row.total_purchase_amount);
      const cumulativePercentage = (cumulativePurchaseAmount / totalOverallPurchaseAmount) * 100;
      let category = 'C';
      if (cumulativePercentage <= 80) {
        category = 'A';
      } else if (cumulativePercentage <= 95) {
        category = 'B';
      }
      return { ...row, cumulative_purchase_amount: parseFloat(cumulativePurchaseAmount.toFixed(2)), cumulative_percentage: parseFloat(cumulativePercentage.toFixed(2)), category };
    });

    res.json(abcAnalysis);
  } catch (error) {
    console.error('Erro ao gerar análise ABC de clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter métricas do Kanban
// @route   GET /api/reports/kanban
// @access  Private
const getKanbanMetrics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Total de reparos por status
    const repairsByStatus = await db.query(
      'SELECT status, COUNT(*) FROM repairs GROUP BY status;',
    );

    // Reparos concluídos por técnico no período
    const completedRepairsByTechnician = await db.query(
      `SELECT 
        t.name as technician_name, 
        COUNT(r.id) as completed_repairs
      FROM repairs r
      JOIN technicians t ON r.technician_id = t.id
      WHERE r.status = 'Entregue' AND r.actual_completion_date BETWEEN $1 AND $2
      GROUP BY t.name
      ORDER BY completed_repairs DESC;
      `,
      [startDate, endDate]
    );

    // Tempo médio em cada status (exemplo simplificado, requer tabela de histórico de status)
    // Para um cálculo preciso, precisaríamos de uma tabela repair_status_history com entry_date e exit_date para cada status
    const avgTimeInStatus = await db.query(
      `SELECT 
        status, 
        AVG(EXTRACT(EPOCH FROM (actual_completion_date - start_date))) / 3600 AS avg_hours_to_complete
      FROM repairs
      WHERE actual_completion_date IS NOT NULL
      GROUP BY status;
      `
    );

    res.status(200).json({
      repairsByStatus: repairsByStatus.rows,
      completedRepairsByTechnician: completedRepairsByTechnician.rows,
      avgTimeInStatus: avgTimeInStatus.rows,
    });

  } catch (error) {
    console.error('Erro ao buscar métricas do Kanban:', error);
    next(new AppError('Erro ao buscar métricas do Kanban.', 500));
  }
};

// @desc    Gerar relatório de lucratividade por produto detalhado
// @route   GET /api/reports/product-profitability
// @access  Private
const getProductProfitabilityReport = async (req, res) => {
  const { startDate, endDate, productId, categoryId } = req.query;
  try {
    let query = `
      SELECT
        p.id as product_id,
        p.name as product_name,
        pv.barcode,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.quantity * si.price_at_sale) as total_revenue,
        SUM(si.quantity * si.cost_at_sale) as total_cost,
        (SUM(si.quantity * si.price_at_sale) - SUM(si.quantity * si.cost_at_sale)) as gross_profit,
        (SUM(si.quantity * si.price_at_sale) - SUM(si.quantity * si.cost_at_sale)) / SUM(si.quantity * si.price_at_sale) * 100 as profit_margin_percentage
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN product_variations pv ON si.product_id = pv.id -- Assuming product_id in sale_items refers to product_variations.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.sale_date BETWEEN $1 AND $2
    `;
    const queryParams = [startDate, endDate];
    let paramIndex = 3;

    if (productId) {
      query += ` AND p.id = ${paramIndex++}`;
      queryParams.push(productId);
    }
    if (categoryId) {
      query += ` AND p.category_id = ${paramIndex++}`;
      queryParams.push(categoryId);
    }

    query += ` GROUP BY p.id, p.name, pv.barcode ORDER BY gross_profit DESC;`;

    const { rows } = await db.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de lucratividade por produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter logs de auditoria
// @route   GET /api/reports/audit-logs
// @access  Private
const getAuditLogs = async (req, res, next) => {
  try {
    // Placeholder: Implementar a lógica para obter logs de auditoria aqui
    res.status(200).json({ message: 'Logs de auditoria (placeholder) - Implementar lógica aqui.', data: [] });
  } catch (error) {
    next(new AppError('Erro ao obter logs de auditoria.', 500));
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getProfitabilityReport,
  getAccountingExport,
  getSalesByCategoryReport,
  getLowStockProductsReport,
  getTechnicianPerformanceReport,
  getAbcProductAnalysis,
  getAbcCustomerAnalysis,
  getKanbanMetrics,
  getProductProfitabilityReport,
  getAuditLogs,
};