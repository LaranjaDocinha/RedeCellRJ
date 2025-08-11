const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Criar uma nova projeção de fluxo de caixa
exports.createCashFlowProjection = async (req, res) => {
  const { projection_date, projected_inflow, projected_outflow, notes } = req.body;

  if (!projection_date || projected_inflow === undefined || projected_outflow === undefined) {
    return res.status(400).json({ message: 'Dados da projeção incompletos.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO cash_flow_projections (projection_date, projected_inflow, projected_outflow, notes) VALUES ($1, $2, $3, $4) RETURNING *;',
      [projection_date, projected_inflow, projected_outflow, notes || null]
    );
    const projection = result.rows[0];

    await logActivity(req.user.name, `Projeção de fluxo de caixa para ${projection_date} criada.`, 'cash_flow_projection', projection.id);

    res.status(201).json(projection);
  } catch (error) {
    console.error('Erro ao criar projeção de fluxo de caixa:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Obter todas as projeções de fluxo de caixa
exports.getAllCashFlowProjections = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM cash_flow_projections ORDER BY projection_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar projeções de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter uma projeção de fluxo de caixa por ID
exports.getCashFlowProjectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM cash_flow_projections WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Projeção de fluxo de caixa não encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar projeção de fluxo de caixa ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar uma projeção de fluxo de caixa
exports.updateCashFlowProjection = async (req, res) => {
  const { id } = req.params;
  const { projection_date, projected_inflow, projected_outflow, notes } = req.body;

  try {
    const result = await db.query(
      'UPDATE cash_flow_projections SET projection_date = $1, projected_inflow = $2, projected_outflow = $3, notes = $4, updated_at = NOW() WHERE id = $5 RETURNING *;',
      [projection_date, projected_inflow, projected_outflow, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Projeção de fluxo de caixa não encontrada.' });
    }

    await logActivity(req.user.name, `Projeção de fluxo de caixa #${id} atualizada.`, 'cash_flow_projection', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar projeção de fluxo de caixa ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Deletar uma projeção de fluxo de caixa
exports.deleteCashFlowProjection = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM cash_flow_projections WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Projeção de fluxo de caixa não encontrada.' });
    }

    await logActivity(req.user.name, `Projeção de fluxo de caixa #${id} deletada.`, 'cash_flow_projection', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar projeção de fluxo de caixa ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Gerar relatório de fluxo de caixa (Previsto vs. Realizado)
exports.getCashFlowReport = async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Datas de início e fim são obrigatórias.' });
  }

  try {
    const [
      projectionsResult,
      actualInflowSalesResult,
      actualInflowARResult,
      actualOutflowExpensesResult,
      actualOutflowAPResult
    ] = await Promise.all([
      // 1. Obter projeções
      db.query(
        'SELECT projection_date, projected_inflow, projected_outflow FROM cash_flow_projections WHERE projection_date >= $1 AND projection_date <= $2 ORDER BY projection_date;',
        [start_date, end_date]
      ),
      // 2. Obter entradas reais (vendas)
      db.query(
        'SELECT sale_date::date as date, SUM(total_amount) as amount FROM sales WHERE sale_date >= $1 AND sale_date <= $2 GROUP BY sale_date::date ORDER BY sale_date::date;',
        [start_date, end_date]
      ),
      // 3. Obter entradas reais (contas a receber)
      db.query(
        'SELECT due_date::date as date, SUM(amount) as amount FROM accounts_receivable WHERE status = \'paid\' AND payment_date >= $1 AND payment_date <= $2 GROUP BY due_date::date ORDER BY due_date::date;',
        [start_date, end_date]
      ),
      // 4. Obter saídas reais (compras/despesas)
      db.query(
        'SELECT expense_date::date as date, SUM(amount) as amount FROM expenses WHERE expense_date >= $1 AND expense_date <= $2 GROUP BY expense_date::date ORDER BY expense_date::date;',
        [start_date, end_date]
      ),
      // 5. Obter saídas reais (contas a pagar)
      db.query(
        'SELECT due_date::date as date, SUM(amount) as amount FROM accounts_payable WHERE status = \'paid\' AND payment_date >= $1 AND payment_date <= $2 GROUP BY due_date::date ORDER BY due_date::date;',
        [start_date, end_date]
      )
    ]);

    const projections = projectionsResult.rows;
    const actualInflowSales = actualInflowSalesResult.rows;
    const actualInflowAR = actualInflowARResult.rows;
    const actualOutflowExpenses = actualOutflowExpensesResult.rows;
    const actualOutflowAP = actualOutflowAPResult.rows;

    // Consolidar dados por data
    const reportData = {};

    const addData = (source, type) => {
      source.forEach(row => {
        const date = row.date.toISOString().split('T')[0];
        if (!reportData[date]) {
          reportData[date] = {
            date: date,
            projected_inflow: 0,
            projected_outflow: 0,
            actual_inflow: 0,
            actual_outflow: 0,
          };
        }
        if (type === 'projected_inflow') reportData[date].projected_inflow += parseFloat(row.projected_inflow);
        if (type === 'projected_outflow') reportData[date].projected_outflow += parseFloat(row.projected_outflow);
        if (type === 'actual_inflow') reportData[date].actual_inflow += parseFloat(row.amount);
        if (type === 'actual_outflow') reportData[date].actual_outflow += parseFloat(row.amount);
      });
    };

    addData(projections, 'projected_inflow');
    addData(projections, 'projected_outflow');
    addData(actualInflowSales, 'actual_inflow');
    addData(actualInflowAR, 'actual_inflow');
    addData(actualOutflowExpenses, 'actual_outflow');
    addData(actualOutflowAP, 'actual_outflow');

    const sortedReport = Object.values(reportData).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(sortedReport);
  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Gerar relatório de fluxo de caixa por categoria
exports.getCashFlowReportByCategory = async (req, res) => {
  const { start_date, end_date, category_type } = req.query; // category_type can be 'inflow', 'outflow', or undefined

  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Datas de início e fim são obrigatórias.' });
  }

  try {
    const reportData = {};

    // Helper to add data to reportData
    const addData = (date, category, type, amount) => {
      const dateKey = date.toISOString().split('T')[0];
      if (!reportData[dateKey]) {
        reportData[dateKey] = { date: dateKey, categories: {} };
      }
      if (!reportData[dateKey].categories[category]) {
        reportData[dateKey].categories[category] = { inflow: 0, outflow: 0 };
      }
      reportData[dateKey].categories[category][type] += parseFloat(amount);
    };

    const queries = [];

    // 1. Obter entradas reais (vendas) por categoria
    if (!category_type || category_type === 'inflow') {
      queries.push(db.query(
        `SELECT
          s.sale_date::date as date,
          c.name as category,
          SUM(si.quantity * si.unit_price) as amount
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN product_variations pv ON si.variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE s.sale_date >= $1 AND s.sale_date <= $2
        GROUP BY s.sale_date::date, c.name
        ORDER BY s.sale_date::date, c.name;`,
        [start_date, end_date]
      ).then(result => ({ type: 'sales', rows: result.rows })));
    }

    // 2. Obter saídas reais (despesas) por categoria
    if (!category_type || category_type === 'outflow') {
      queries.push(db.query(
        `SELECT
          expense_date::date as date,
          category,
          SUM(amount) as amount
        FROM expenses
        WHERE expense_date >= $1 AND expense_date <= $2
        GROUP BY expense_date::date, category
        ORDER BY expense_date::date, category;`,
        [start_date, end_date]
      ).then(result => ({ type: 'expenses', rows: result.rows })));
    }

    // 3. Obter entradas reais (contas a receber) - Não categorizadas
    if (!category_type || category_type === 'inflow') {
      queries.push(db.query(
        `SELECT
          due_date::date as date,
          SUM(amount) as amount
        FROM accounts_receivable
        WHERE status = 'paid' AND payment_date >= $1 AND payment_date <= $2
        GROUP BY due_date::date
        ORDER BY due_date::date;`,
        [start_date, end_date]
      ).then(result => ({ type: 'ar', rows: result.rows })));
    }

    // 4. Obter saídas reais (contas a pagar) - Não categorizadas
    if (!category_type || category_type === 'outflow') {
      queries.push(db.query(
        `SELECT
          due_date::date as date,
          SUM(amount) as amount
        FROM accounts_payable
        WHERE status = 'paid' AND payment_date >= $1 AND payment_date <= $2
        GROUP BY due_date::date
        ORDER BY due_date::date;`,
        [start_date, end_date]
      ).then(result => ({ type: 'ap', rows: result.rows })));
    }

    const results = await Promise.all(queries);

    results.forEach(result => {
      if (result.type === 'sales') {
        result.rows.forEach(row => addData(row.date, row.category, 'inflow', row.amount));
      } else if (result.type === 'expenses') {
        result.rows.forEach(row => addData(row.date, row.category || 'Outros', 'outflow', row.amount));
      } else if (result.type === 'ar') {
        result.rows.forEach(row => addData(row.date, 'Contas a Receber (Não Categorizado)', 'inflow', row.amount));
      } else if (result.type === 'ap') {
        result.rows.forEach(row => addData(row.date, 'Contas a Pagar (Não Categorizado)', 'outflow', row.amount));
      }
    });

    // Convert reportData object to a sorted array
    const sortedReport = Object.values(reportData).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(sortedReport);
  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa por categoria:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};