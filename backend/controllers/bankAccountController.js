const pool = require('../db');
const { AppError } = require('../utils/appError');

// @desc    Obter todas as contas bancárias
// @route   GET /api/bank-accounts
// @access  Private
exports.getAllBankAccounts = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bank_accounts ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (error) {
    next(new AppError('Erro ao buscar contas bancárias.', 500));
  }
};

// @desc    Obter uma conta bancária por ID
// @route   GET /api/bank-accounts/:id
// @access  Private
exports.getBankAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM bank_accounts WHERE id = $1', [id]);

    if (rows.length === 0) {
      return next(new AppError('Conta bancária não encontrada.', 404));
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(new AppError('Erro ao buscar a conta bancária.', 500));
  }
};

// @desc    Criar uma nova conta bancária
// @route   POST /api/bank-accounts
// @access  Private
exports.createBankAccount = async (req, res, next) => {
  try {
    const { name, bank_name, account_number, initial_balance } = req.body;

    const { rows } = await pool.query(
      'INSERT INTO bank_accounts (name, bank_name, account_number, initial_balance, current_balance) VALUES ($1, $2, $3, $4, $4) RETURNING *',
      [name, bank_name, account_number, initial_balance]
    );

    res.status(201).json({
      message: 'Conta bancária criada com sucesso!',
      account: rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // unique_violation
        return next(new AppError('O número da conta já está em uso.', 409));
    }
    next(new AppError('Erro ao criar a conta bancária.', 500));
  }
};

// @desc    Atualizar uma conta bancária
// @route   PUT /api/bank-accounts/:id
// @access  Private
exports.updateBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, bank_name, account_number, initial_balance } = req.body;

    // Nota: A atualização do current_balance deve ser feita por transações, não diretamente aqui.
    const { rows } = await pool.query(
      'UPDATE bank_accounts SET name = $1, bank_name = $2, account_number = $3, initial_balance = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, bank_name, account_number, initial_balance, id]
    );

    if (rows.length === 0) {
      return next(new AppError('Conta bancária não encontrada para atualização.', 404));
    }

    res.status(200).json({
      message: 'Conta bancária atualizada com sucesso!',
      account: rows[0]
    });
  } catch (error) {
     if (error.code === '23505') { // unique_violation
        return next(new AppError('O número da conta já está em uso.', 409));
    }
    next(new AppError('Erro ao atualizar a conta bancária.', 500));
  }
};

// @desc    Deletar uma conta bancária
// @route   DELETE /api/bank-accounts/:id
// @access  Private
exports.deleteBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM bank_accounts WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return next(new AppError('Conta bancária não encontrada para exclusão.', 404));
    }

    res.status(204).send();
  } catch (error) {
    // Captura erro de restrição de chave estrangeira
    if (error.code === '23503') { 
      return next(new AppError('Não é possível excluir a conta, pois existem transações associadas a ela.', 409));
    }
    next(new AppError('Erro ao deletar a conta bancária.', 500));
  }
};