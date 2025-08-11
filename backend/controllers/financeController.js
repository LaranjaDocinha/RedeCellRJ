const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// @desc    Obter resumo financeiro
// @route   GET /api/finance/summary
// @access  Private
exports.getFinancialSummary = async (req, res) => {
  try {
    // Exemplo: Total de vendas no mês
    const salesSummary = await db.query(
      `SELECT SUM(total_amount) as total_sales FROM sales WHERE sale_date >= date_trunc('month', NOW());`
    );
    // Exemplo: Total de despesas no mês
    const expensesSummary = await db.query(
      `SELECT SUM(amount) as total_expenses FROM expenses WHERE expense_date >= date_trunc('month', NOW());`
    );

    res.json({
      totalSales: salesSummary.rows[0].total_sales || 0,
      totalExpenses: expensesSummary.rows[0].total_expenses || 0,
      // Adicione mais resumos conforme necessário
    });
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar resumo financeiro.' });
  }
};

// @desc    Obter todas as despesas
// @route   GET /api/finance/expenses
// @access  Private
exports.getAllExpenses = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ message: 'Erro interno ao buscar despesas.' });
  }
};

// @desc    Obter uma despesa por ID
// @route   GET /api/finance/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar despesa:', error);
    res.status(500).json({ message: 'Erro interno ao buscar despesa.' });
  }
};

// @desc    Criar uma nova despesa
// @route   POST /api/finance/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  const { description, amount, expense_date, category, payment_method, notes } = req.body;
  const user_id = req.user.id;

  if (!description || !amount || !expense_date) {
    return res.status(400).json({ message: 'Descrição, valor e data da despesa são obrigatórios.' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO expenses (user_id, description, amount, expense_date, category, payment_method, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
      [user_id, description, amount, expense_date, category, payment_method, notes]
    );
    await logActivity(req.user.name, `Despesa de R${amount} (${description}) registrada.`, 'expense', rows[0].id);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Atualizar uma despesa
// @route   PUT /api/finance/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { description, amount, expense_date, category, payment_method, notes } = req.body;

  if (!description || !amount || !expense_date) {
    return res.status(400).json({ message: 'Descrição, valor e data da despesa são obrigatórios.' });
  }

  try {
    const { rows } = await db.query(
      'UPDATE expenses SET description = $1, amount = $2, expense_date = $3, category = $4, payment_method = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *;',
      [description, amount, expense_date, category, payment_method, notes, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }
    await logActivity(req.user.name, `Despesa (ID: ${id}) atualizada.`, 'expense', id);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Deletar uma despesa
// @route   DELETE /api/finance/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM expenses WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }
    await logActivity(req.user.name, `Despesa (ID: ${id}) excluída.`, 'expense', id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter dados para o dashboard financeiro
// @route   GET /api/finance/dashboard
// @access  Private
exports.getFinanceDashboardData = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Total de Vendas
    const totalSalesResult = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_sales FROM sales WHERE sale_date BETWEEN $1 AND $2;`,
      [startDate, endDate]
    );
    const totalSales = parseFloat(totalSalesResult.rows[0].total_sales);

    // Total de Despesas
    const totalExpensesResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE expense_date BETWEEN $1 AND $2;`,
      [startDate, endDate]
    );
    const totalExpenses = parseFloat(totalExpensesResult.rows[0].total_expenses);

    // Lucro Bruto (simplificado: vendas - despesas)
    const grossProfit = totalSales - totalExpenses;

    // Vendas por Método de Pagamento
    const salesByPaymentMethod = await db.query(
      `SELECT payment_method, COALESCE(SUM(total_amount), 0) as amount FROM sales WHERE sale_date BETWEEN $1 AND $2 GROUP BY payment_method;`,
      [startDate, endDate]
    );

    // Despesas por Categoria
    const expensesByCategory = await db.query(
      `SELECT category, COALESCE(SUM(amount), 0) as amount FROM expenses WHERE expense_date BETWEEN $1 AND $2 GROUP BY category;`,
      [startDate, endDate]
    );

    res.json({
      kpis: {
        totalSales,
        totalExpenses,
        grossProfit,
      },
      charts: {
        salesByPaymentMethod: salesByPaymentMethod.rows,
        expensesByCategory: expensesByCategory.rows,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard financeiro:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
