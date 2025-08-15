const pool = require('../db');
const { AppError } = require('../utils/appError');

// @desc    Obter todas as despesas com filtros e paginação
// @route   GET /api/expenses
// @access  Private
exports.getAllExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM expenses';
    const queryParams = [];
    const whereClauses = [];

    if (category) {
      queryParams.push(category);
      whereClauses.push(`category = $${queryParams.length}`);
    }

    if (startDate) {
      queryParams.push(startDate);
      whereClauses.push(`expense_date >= $${queryParams.length}`);
    }

    if (endDate) {
      queryParams.push(endDate);
      whereClauses.push(`expense_date <= $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Adiciona ordenação e paginação
    query += ' ORDER BY expense_date DESC, created_at DESC';
    queryParams.push(limit, offset);
    query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    const { rows } = await pool.query(query, queryParams);

    // Query para contagem total para paginação
    let countQuery = 'SELECT COUNT(*) FROM expenses';
    if (whereClauses.length > 0) {
      // Reutiliza a mesma cláusula WHERE, mas sem os parâmetros de limit/offset
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    const totalResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(totalResult.rows[0].count, 10);

    res.status(200).json({
      expenses: rows,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(new AppError('Erro ao buscar despesas.', 500));
  }
};

// @desc    Obter uma despesa por ID
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);

    if (rows.length === 0) {
      return next(new AppError('Despesa não encontrada.', 404));
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(new AppError('Erro ao buscar a despesa.', 500));
  }
};

// @desc    Criar uma nova despesa
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    const { description, amount, expense_date, category, payment_method, notes } = req.body;
    const userId = req.user.id; // Obtido do middleware de autenticação

    const { rows } = await pool.query(
      'INSERT INTO expenses (description, amount, expense_date, category, payment_method, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [description, amount, expense_date, category, payment_method, notes, userId]
    );

    res.status(201).json({ 
      message: 'Despesa criada com sucesso!',
      expense: rows[0]
    });
  } catch (error) {
    next(new AppError('Erro ao criar a despesa.', 500));
  }
};

// @desc    Atualizar uma despesa
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, amount, expense_date, category, payment_method, notes } = req.body;

    const { rows } = await pool.query(
      'UPDATE expenses SET description = $1, amount = $2, expense_date = $3, category = $4, payment_method = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [description, amount, expense_date, category, payment_method, notes, id]
    );

    if (rows.length === 0) {
      return next(new AppError('Despesa não encontrada para atualização.', 404));
    }

    res.status(200).json({
      message: 'Despesa atualizada com sucesso!',
      expense: rows[0]
    });
  } catch (error) {
    next(new AppError('Erro ao atualizar a despesa.', 500));
  }
};

// @desc    Deletar uma despesa
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return next(new AppError('Despesa não encontrada para exclusão.', 404));
    }

    res.status(204).send(); // No Content
  } catch (error) {
    next(new AppError('Erro ao deletar a despesa.', 500));
  }
};