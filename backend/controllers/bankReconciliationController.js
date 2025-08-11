const db = require('../db');
const { logActivity } = require('../utils/activityLogger');
// Removed csv, fs, multer, upload as they are no longer needed here

// Obter vendas não conciliadas
exports.getUnreconciledSales = async (req, res) => {
  const { start_date, end_date } = req.query;
  let query = `
    SELECT s.id, s.sale_date as date, s.total_amount as amount, 'sale' as type, c.name as customer_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE NOT EXISTS (
      SELECT 1 FROM bank_transactions bt
      WHERE bt.reconciled_with_id = s.id AND bt.reconciled_with_type = 'sale'
    )
  `;
  const params = [];
  let paramIndex = 1;

  if (start_date) {
    query += ` AND s.sale_date >= ${paramIndex++}`;
    params.push(start_date);
  }
  if (end_date) {
    query += ` AND s.sale_date <= ${paramIndex++}`;
    params.push(end_date);
  }
  query += ' ORDER BY s.sale_date DESC;';

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar vendas não conciliadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter despesas não conciliadas
exports.getUnreconciledExpenses = async (req, res) => {
  const { start_date, end_date } = req.query;
  let query = `
    SELECT e.id, e.expense_date as date, e.amount, 'expense' as type, e.description, e.category
    FROM expenses e
    WHERE NOT EXISTS (
      SELECT 1 FROM bank_transactions bt
      WHERE bt.reconciled_with_id = e.id AND bt.reconciled_with_type = 'expense'
    )
  `;
  const params = [];
  let paramIndex = 1;

  if (start_date) {
    query += ` AND e.expense_date >= ${paramIndex++}`;
    params.push(start_date);
  }
  if (end_date) {
    query += ` AND e.expense_date <= ${paramIndex++}`;
    params.push(end_date);
  }
  query += ' ORDER BY e.expense_date DESC;';

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar despesas não conciliadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter contas a receber não conciliadas
exports.getUnreconciledAccountsReceivable = async (req, res) => {
  const { start_date, end_date } = req.query;
  let query = `
    SELECT ar.id, ar.due_date as date, ar.amount, 'accounts_receivable' as type, ar.description, ar.status
    FROM accounts_receivable ar
    WHERE ar.status = 'paid' AND NOT EXISTS (
      SELECT 1 FROM bank_transactions bt
      WHERE bt.reconciled_with_id = ar.id AND bt.reconciled_with_type = 'accounts_receivable'
    )
  `;
  const params = [];
  let paramIndex = 1;

  if (start_date) {
    query += ` AND ar.due_date >= ${paramIndex++}`;
    params.push(start_date);
  }
  if (end_date) {
    query += ` AND ar.due_date <= ${paramIndex++}`;
    params.push(end_date);
  }
  query += ' ORDER BY ar.due_date DESC;';

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar contas a receber não conciliadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter contas a pagar não conciliadas
exports.getUnreconciledAccountsPayable = async (req, res) => {
  const { start_date, end_date } = req.query;
  let query = `
    SELECT ap.id, ap.due_date as date, ap.amount, 'accounts_payable' as type, ap.description, ap.status
    FROM accounts_payable ap
    WHERE ap.status = 'paid' AND NOT EXISTS (
      SELECT 1 FROM bank_transactions bt
      WHERE bt.reconciled_with_id = ap.id AND bt.reconciled_with_type = 'accounts_payable'
    )
  `;
  const params = [];
  let paramIndex = 1;

  if (start_date) {
    query += ` AND ap.due_date >= ${paramIndex++}`;
    params.push(start_date);
  }
  if (end_date) {
    query += ` AND ap.due_date <= ${paramIndex++}`;
    params.push(end_date);
  }
  query += ' ORDER BY ap.due_date DESC;';

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar contas a pagar não conciliadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Conciliação
exports.reconcileTransaction = async (req, res) => {
  const { id } = req.params;
  const { reconciled_with_id, reconciled_with_type } = req.body;

  if (!reconciled_with_id || !reconciled_with_type) {
    return res.status(400).json({ message: 'ID e tipo da transação interna são obrigatórios para conciliação.' });
  }

  try {
    const result = await db.query(
      'UPDATE bank_transactions SET reconciled = TRUE, reconciled_with_id = $1, reconciled_with_type = $2, updated_at = NOW() WHERE id = $3 RETURNING *;',
      [reconciled_with_id, reconciled_with_type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transação bancária não encontrada.' });
    }

    await logActivity(req.user.name, `Transação bancária #${id} conciliada com ${reconciled_with_type} #${reconciled_with_id}.`, 'bank_reconciliation', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao conciliar transação ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

exports.unreconcileTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE bank_transactions SET reconciled = FALSE, reconciled_with_id = NULL, reconciled_with_type = NULL, updated_at = NOW() WHERE id = $1 RETURNING *;'
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transação bancária não encontrada.' });
    }

    await logActivity(req.user.name, `Transação bancária #${id} desconciliada.`, 'bank_reconciliation', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao desconciliar transação ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Função para realizar a conciliação automática
exports.performAutomaticReconciliation = async (req, res) => {
  const { bank_account_id, start_date, end_date } = req.body;

  if (!bank_account_id || !start_date || !end_date) {
    return res.status(400).json({ message: 'ID da conta bancária, data de início e data de fim são obrigatórios.' });
  }

  const client = await db.getClient();
  let reconciledCount = 0;
  const reconciliationReport = {
    successful: [],
    failed: [],
  };

  try {
    await client.query('BEGIN');

    const [
      bankTransactionsResult,
      unreconciledSalesResult,
      unreconciledExpensesResult,
      unreconciledAccountsReceivableResult,
      unreconciledAccountsPayableResult
    ] = await Promise.all([
      // 1. Obter transações bancárias não conciliadas no período
      client.query(
        'SELECT * FROM bank_transactions WHERE bank_account_id = $1 AND reconciled = FALSE AND transaction_date >= $2 AND transaction_date <= $3 ORDER BY transaction_date ASC;',
        [bank_account_id, start_date, end_date]
      ),
      // 2. Obter transações internas não conciliadas no período
      client.query(
        `SELECT id, total_amount as amount, sale_date as date, 'sale' as type
         FROM sales
         WHERE sale_date >= $1 AND sale_date <= $2 AND NOT EXISTS (SELECT 1 FROM bank_transactions WHERE reconciled_with_id = sales.id AND reconciled_with_type = 'sale');`,
        [start_date, end_date]
      ),
      client.query(
        `SELECT id, amount, expense_date as date, 'expense' as type
         FROM expenses
         WHERE expense_date >= $1 AND expense_date <= $2 AND NOT EXISTS (SELECT 1 FROM bank_transactions WHERE reconciled_with_id = expenses.id AND reconciled_with_type = 'expense');`,
        [start_date, end_date]
      ),
      client.query(
        `SELECT id, amount, due_date as date, 'accounts_receivable' as type
         FROM accounts_receivable
         WHERE status = 'paid' AND due_date >= $1 AND due_date <= $2 AND NOT EXISTS (SELECT 1 FROM bank_transactions WHERE reconciled_with_id = accounts_receivable.id AND reconciled_with_type = 'accounts_receivable');`,
        [start_date, end_date]
      ),
      client.query(
        `SELECT id, amount, due_date as date, 'accounts_payable' as type
         FROM accounts_payable
         WHERE status = 'paid' AND due_date >= $1 AND due_date <= $2 AND NOT EXISTS (SELECT 1 FROM bank_transactions WHERE reconciled_with_id = accounts_payable.id AND reconciled_with_type = 'accounts_payable');`,
        [start_date, end_date]
      )
    ]);

    const bankTransactions = bankTransactionsResult.rows;
    const unreconciledSales = unreconciledSalesResult.rows;
    const unreconciledExpenses = unreconciledExpensesResult.rows;
    const unreconciledAccountsReceivable = unreconciledAccountsReceivableResult.rows;
    const unreconciledAccountsPayable = unreconciledAccountsPayableResult.rows;

    const allUnreconciledInternalTransactions = [
      ...unreconciledSales,
      ...unreconciledExpenses,
      ...unreconciledAccountsReceivable,
      ...unreconciledAccountsPayable,
    ];

    // Mapear transações internas para facilitar a busca
    const internalTransactionsMap = new Map(); // Key: amount, Value: Array of transactions
    allUnreconciledInternalTransactions.forEach(tx => {
      const key = tx.amount.toFixed(2); // Use fixed precision for amount comparison
      if (!internalTransactionsMap.has(key)) {
        internalTransactionsMap.set(key, []);
      }
      internalTransactionsMap.get(key).push(tx);
    });

    // Tentar conciliar
    for (const bankTx of bankTransactions) {
      const bankTxAmount = parseFloat(bankTx.amount);
      const bankTxDate = new Date(bankTx.transaction_date);
      const potentialMatches = internalTransactionsMap.get(bankTxAmount.toFixed(2));

      if (potentialMatches && potentialMatches.length > 0) {
        let matched = false;
        for (const internalTx of potentialMatches) {
          const internalTxDate = new Date(internalTx.date);
          const dateDiff = Math.abs(bankTxDate.getTime() - internalTxDate.getTime());
          const daysDiff = dateDiff / (1000 * 60 * 60 * 24);

          // Basic matching: amount and date proximity (e.g., within 3 days)
          if (daysDiff <= 3) {
            // Check type consistency
            const isCreditMatch = bankTx.type === 'credit' && (internalTx.type === 'sale' || internalTx.type === 'accounts_receivable');
            const isDebitMatch = bankTx.type === 'debit' && (internalTx.type === 'expense' || internalTx.type === 'accounts_payable');

            if (isCreditMatch || isDebitMatch) {
              // Perform reconciliation
              await client.query(
                'UPDATE bank_transactions SET reconciled = TRUE, reconciled_with_id = $1, reconciled_with_type = $2, updated_at = NOW() WHERE id = $3;',
                [internalTx.id, internalTx.type, bankTx.id]
              );
              reconciledCount++;
              reconciliationReport.successful.push({ bankTransaction: bankTx, internalTransaction: internalTx });

              // Remove internal transaction from map to avoid re-matching
              const index = internalTransactionsMap.get(bankTxAmount.toFixed(2)).indexOf(internalTx);
              if (index > -1) {
                internalTransactionsMap.get(bankTxAmount.toFixed(2)).splice(index, 1);
              }
              matched = true;
              break; // Move to next bank transaction
            }
          }
        }
        if (!matched) {
          reconciliationReport.failed.push({ bankTransaction: bankTx, reason: 'No matching internal transaction found within date proximity or type consistency.' });
        }
      } else {
        reconciliationReport.failed.push({ bankTransaction: bankTx, reason: 'No internal transaction with matching amount found.' });
      }
    }

    await client.query('COMMIT');
    await logActivity(req.user.name, `Conciliação automática realizada para a conta bancária #${bank_account_id}. ${reconciledCount} transações conciliadas.`, 'bank_reconciliation', bank_account_id);
    res.status(200).json({ message: `Conciliação automática concluída. ${reconciledCount} transações conciliadas.`, report: reconciliationReport });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao realizar conciliação automática:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Relatório de Conciliação
exports.getReconciliationReport = async (req, res) => {
  const { bank_account_id, start_date, end_date } = req.query;

  if (!bank_account_id || !start_date || !end_date) {
    return res.status(400).json({ message: 'ID da conta bancária, data de início e data de fim são obrigatórios.' });
  }

  try {
    const report = {
      bank_transactions: [],
      internal_transactions: {
        sales: [],
        expenses: [],
        payouts: [],
        // Adicionar outros tipos de transações internas conforme necessário
      },
      unreconciled_bank_transactions: [],
      unreconciled_internal_transactions: [],
      balance_difference: 0,
    };

    const [      bankTxResult,      salesResult,      expensesResult,      payoutsResult    ] = await Promise.all([
      // 1. Obter transações bancárias no período
      db.query(
        'SELECT * FROM bank_transactions WHERE bank_account_id = $1 AND transaction_date >= $2 AND transaction_date <= $3 ORDER BY transaction_date ASC;',
        [bank_account_id, start_date, end_date]
      ),
      // 2. Obter transações internas relevantes (simplificado para exemplo)
      // Vendas
      db.query(
        'SELECT id, total_amount as amount, sale_date as date, \'sale\' as type FROM sales WHERE sale_date >= $1 AND sale_date <= $2 ORDER BY sale_date ASC;',
        [start_date, end_date]
      ),
      // Despesas
      db.query(
        'SELECT id, amount, expense_date as date, \'expense\' as type FROM expenses WHERE expense_date >= $1 AND expense_date <= $2 ORDER BY expense_date ASC;',
        [start_date, end_date]
      ),
      // Pagamentos de Comissão
      db.query(
        'SELECT id, amount, payout_date as date, \'payout\' as type FROM commission_payouts WHERE payout_date >= $1 AND payout_date <= $2 ORDER BY payout_date ASC;',
        [start_date, end_date]
      )
    ]);

    report.bank_transactions = bankTxResult.rows;
    report.internal_transactions.sales = salesResult.rows;
    report.internal_transactions.expenses = expensesResult.rows;
    report.internal_transactions.payouts = payoutsResult.rows;

    // 3. Identificar transações não conciliadas
    report.unreconciled_bank_transactions = report.bank_transactions.filter(tx => !tx.reconciled);

    // Para transações internas não conciliadas, seria necessário um controle mais robusto
    // que marcasse as transações internas como 'conciliadas' ou não.
    // Por enquanto, vamos apenas listar as bancárias não conciliadas.

    // 4. Calcular diferença de saldo (simplificado)
    const initialBalanceResult = await db.query(
      'SELECT initial_balance FROM bank_accounts WHERE id = $1;',
      [bank_account_id]
    );
    const initialBalance = initialBalanceResult.rows[0]?.initial_balance || 0;

    const totalBankInflow = report.bank_transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalBankOutflow = report.bank_transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const finalBankBalance = initialBalance + totalBankInflow - totalBankOutflow;

    // Para o saldo interno, seria necessário somar todas as transações internas no período
    // e comparar com o saldo bancário.
    // Por simplicidade, vamos apenas retornar a diferença entre o saldo final do extrato
    // e o saldo esperado com base nas transações internas conciliadas.

    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório de conciliação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};