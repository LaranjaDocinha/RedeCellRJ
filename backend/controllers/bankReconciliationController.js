const pool = require('../db');
const { AppError } = require('../utils/appError');
const fs = require('fs');
const csv = require('csv-parser');

// @desc    Upload de extrato bancário e criação de transações
// @route   POST /api/bank-reconciliation/:accountId/upload
// @access  Private
exports.uploadStatement = async (req, res, next) => {
  const { accountId } = req.params;
  const filePath = req.file?.path;

  if (!filePath) {
    return next(new AppError('Nenhum arquivo de extrato enviado.', 400));
  }

  const client = await pool.getClient();
  const transactions = [];

  fs.createReadStream(filePath)
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim(),
      mapValues: ({ value }) => value.trim()
    }))
    .on('data', (row) => {
      // Adapte os nomes das colunas conforme o formato do seu extrato CSV
      const { Data, Descricao, Valor } = row;
      if (Data && Descricao && Valor) {
        transactions.push({
          date: new Date(Data.split('/').reverse().join('-')), // Ex: DD/MM/AAAA -> AAAA-MM-DD
          description: Descricao,
          amount: parseFloat(Valor.replace('.', '').replace(',', '.')),
        });
      }
    })
    .on('end', async () => {
      try {
        await client.query('BEGIN');

        for (const t of transactions) {
          const type = t.amount >= 0 ? 'credit' : 'debit';
          const amount = Math.abs(t.amount);

          await client.query(
            `INSERT INTO bank_transactions 
             (bank_account_id, transaction_date, description, amount, type, reconciled) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [accountId, t.date, t.description, amount, type, false]
          );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: `${transactions.length} transações importadas com sucesso.` });

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao processar o extrato:', error);
        next(new AppError('Erro ao salvar as transações do extrato no banco de dados.', 500));
      } finally {
        client.release();
        // Remove o arquivo temporário após o processamento
        fs.unlink(filePath, (err) => {
          if (err) console.error('Erro ao remover arquivo temporário:', err);
        });
      }
    })
    .on('error', (error) => {
        next(new AppError(`Erro ao ler o arquivo CSV: ${error.message}`, 400));
    });
};

// @desc    Obter transações não conciliadas (bancárias e internas)
// @route   GET /api/bank-reconciliation/:accountId/unreconciled
// @access  Private
exports.getUnreconciledData = async (req, res, next) => {
  const { accountId } = req.params;
  const client = await pool.getClient();

  try {
    // 1. Obter transações bancárias não conciliadas para a conta
    const bankTransactionsResult = await client.query(
      'SELECT id, transaction_date, description, amount, type FROM bank_transactions WHERE bank_account_id = $1 AND reconciled = FALSE ORDER BY transaction_date ASC',
      [accountId]
    );
    const bankTransactions = bankTransactionsResult.rows;

    // 2. Obter transações internas não conciliadas (vendas e despesas)
    // Vendas (inflow)
    const salesQuery = `
      SELECT 
        s.id as internal_id, 
        s.sale_date as date, 
        s.total_amount as amount, 
        'inflow' as type, 
        'sale' as internal_type, 
        'Venda: ' || s.notes as description
      FROM sales s
      LEFT JOIN bank_transactions bt ON bt.reconciled_with_id = s.id AND bt.reconciled_with_type = 'sale'
      WHERE bt.id IS NULL -- Não conciliado
      ORDER BY s.sale_date ASC
    `;
    const salesResult = await client.query(salesQuery);
    const sales = salesResult.rows;

    // Despesas (outflow)
    const expensesQuery = `
      SELECT 
        e.id as internal_id, 
        e.expense_date as date, 
        e.amount as amount, 
        'outflow' as type, 
        'expense' as internal_type, 
        'Despesa: ' || e.description as description
      FROM expenses e
      LEFT JOIN bank_transactions bt ON bt.reconciled_with_id = e.id AND bt.reconciled_with_type = 'expense'
      WHERE bt.id IS NULL -- Não conciliado
      ORDER BY e.expense_date ASC
    `;
    const expensesResult = await client.query(expensesQuery);
    const expenses = expensesResult.rows;

    // Combinar transações internas
    const internalTransactions = [...sales, ...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      bankTransactions,
      internalTransactions,
    });

  } catch (error) {
    console.error('Erro ao buscar dados não conciliados:', error);
    next(new AppError('Erro ao buscar dados para conciliação.', 500));
  } finally {
    client.release();
  }
};

// @desc    Conciliar transações bancárias com transações internas
// @route   POST /api/bank-reconciliation/reconcile
// @access  Private
exports.reconcileTransactions = async (req, res, next) => {
  const { bankTransactionId, internalTransactionId, internalTransactionType } = req.body;

  if (!bankTransactionId || !internalTransactionId || !internalTransactionType) {
    return next(new AppError('Dados de conciliação incompletos.', 400));
  }

  const client = await pool.getClient();

  try {
    await client.query('BEGIN');

    // 1. Marcar a transação bancária como conciliada
    const updateBankTxnResult = await client.query(
      'UPDATE bank_transactions SET reconciled = TRUE, reconciled_with_id = $1, reconciled_with_type = $2, updated_at = NOW() WHERE id = $3 RETURNING *;',
      [internalTransactionId, internalTransactionType, bankTransactionId]
    );

    if (updateBankTxnResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new AppError('Transação bancária não encontrada para conciliação.', 404));
    }

    // 2. Atualizar o current_balance da conta bancária
    // Obter o valor da transação bancária
    const bankTxnAmount = parseFloat(updateBankTxnResult.rows[0].amount);
    const bankTxnType = updateBankTxnResult.rows[0].type;
    const bankAccountId = updateBankTxnResult.rows[0].bank_account_id;

    let balanceChange = 0;
    if (bankTxnType === 'credit') {
      balanceChange = bankTxnAmount;
    } else if (bankTxnType === 'debit') {
      balanceChange = -bankTxnAmount;
    }

    await client.query(
      'UPDATE bank_accounts SET current_balance = current_balance + $1, updated_at = NOW() WHERE id = $2;',
      [balanceChange, bankAccountId]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Transações conciliadas com sucesso!' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao conciliar transações:', error);
    next(new AppError('Erro ao conciliar transações.', 500));
  } finally {
    client.release();
  }
};