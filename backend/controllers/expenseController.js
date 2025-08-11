
const pool = require('../db');

// @desc    Obter todas as despesas
// @route   GET /api/expenses
// @access  Private
const getAllExpenses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Criar uma nova despesa
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  const { description, amount, expense_date, category, branch_id } = req.body;

  if (!description || !amount || !expense_date || !branch_id) {
    return res.status(400).json({ message: 'Descrição, valor, data e filial são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO expenses (description, amount, expense_date, category, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [description, amount, expense_date, category, branch_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar uma despesa
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { description, amount, expense_date, category } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE expenses SET description = $1, amount = $2, expense_date = $3, category = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [description, amount, expense_date, category, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Deletar uma despesa
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
