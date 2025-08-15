const pool = require('../db');
const { AppError } = require('../utils/appError');

// ... (funções CRUD de projeções que já implementamos)

// @desc    Obter todas as projeções de fluxo de caixa
// @route   GET /api/cashflow/projections
// @access  Private
exports.getAllProjections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cash_flow_projections';
    const queryParams = [];
    const whereClauses = [];

    if (type) {
      queryParams.push(type);
      whereClauses.push(`type = $${queryParams.length}`);
    }
    if (startDate) {
      queryParams.push(startDate);
      whereClauses.push(`projection_date >= $${queryParams.length}`);
    }
    if (endDate) {
      queryParams.push(endDate);
      whereClauses.push(`projection_date <= $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY projection_date DESC, created_at DESC';
    queryParams.push(limit, offset);
    query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    const { rows } = await pool.query(query, queryParams);
    
    let countQuery = 'SELECT COUNT(*) FROM cash_flow_projections';
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    const totalResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(totalResult.rows[0].count, 10);

    res.status(200).json({
      projections: rows,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(new AppError('Erro ao buscar projeções de fluxo de caixa.', 500));
  }
};

// @desc    Criar uma nova projeção
// @route   POST /api/cashflow/projections
// @access  Private
exports.createProjection = async (req, res, next) => {
  try {
    const { description, amount, type, projection_date, notes } = req.body;
    const userId = req.user.id;
    const branchId = req.user.branch_id;

    const { rows } = await pool.query(
      'INSERT INTO cash_flow_projections (description, amount, type, projection_date, notes, user_id, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [description, amount, type, projection_date, notes, userId, branchId]
    );

    res.status(201).json({ 
      message: 'Projeção criada com sucesso!',
      projection: rows[0]
    });
  } catch (error) {
    next(new AppError('Erro ao criar projeção.', 500));
  }
};

// @desc    Atualizar uma projeção
// @route   PUT /api/cashflow/projections/:id
// @access  Private
exports.updateProjection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, amount, type, projection_date, notes } = req.body;

    const { rows } = await pool.query(
      'UPDATE cash_flow_projections SET description = $1, amount = $2, type = $3, projection_date = $4, notes = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [description, amount, type, projection_date, notes, id]
    );

    if (rows.length === 0) {
      return next(new AppError('Projeção não encontrada para atualização.', 404));
    }

    res.status(200).json({
      message: 'Projeção atualizada com sucesso!',
      projection: rows[0]
    });
  } catch (error) {
    next(new AppError('Erro ao atualizar projeção.', 500));
  }
};

// @desc    Deletar uma projeção
// @route   DELETE /api/cashflow/projections/:id
// @access  Private
exports.deleteProjection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cash_flow_projections WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return next(new AppError('Projeção não encontrada para exclusão.', 404));
    }

    res.status(204).send();
  } catch (error) {
    next(new AppError('Erro ao deletar projeção.', 500));
  }
};


// @desc    Gerar relatório de fluxo de caixa
// @route   GET /api/cashflow/report
// @access  Private
exports.getCashFlowReport = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('As datas de início e fim são obrigatórias.', 400));
  }

  try {
    // 1. Calcular o saldo inicial (soma de tudo antes da data de início)
    const initialBalanceQuery = `
      SELECT 
        (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE sale_date < $1) - 
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date < $1) as balance
    `;
    const initialBalanceResult = await pool.query(initialBalanceQuery, [startDate]);
    let currentBalance = parseFloat(initialBalanceResult.rows[0].balance);

    // 2. Obter todas as transações (reais e projetadas) no período
    const transactionsQuery = `
      SELECT description, sale_date as date, total_amount as amount, 'inflow' as type, 'Venda' as category FROM sales WHERE sale_date BETWEEN $1 AND $2
      UNION ALL
      SELECT description, expense_date as date, amount, 'outflow' as type, category FROM expenses WHERE expense_date BETWEEN $1 AND $2
      UNION ALL
      SELECT description, projection_date as date, amount, type, 'Projeção' as category FROM cash_flow_projections WHERE projection_date BETWEEN $1 AND $2
      ORDER BY date ASC
    `;
    const transactionsResult = await pool.query(transactionsQuery, [startDate, endDate]);
    const transactions = transactionsResult.rows;

    // 3. Processar transações para criar um extrato diário
    const dailyBreakdown = {};

    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { date, inflows: 0, outflows: 0, transactions: [] };
      }
      if (t.type === 'inflow') {
        dailyBreakdown[date].inflows += parseFloat(t.amount);
      } else {
        dailyBreakdown[date].outflows += parseFloat(t.amount);
      }
      dailyBreakdown[date].transactions.push(t);
    });

    // 4. Calcular o saldo corrente para cada dia
    const report = Object.values(dailyBreakdown).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    report.forEach(day => {
      currentBalance += day.inflows - day.outflows;
      day.balance = currentBalance;
    });

    res.status(200).json({
      initialBalance: parseFloat(initialBalanceResult.rows[0].balance),
      report
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa:', error);
    next(new AppError('Erro ao gerar relatório de fluxo de caixa.', 500));
  }
};