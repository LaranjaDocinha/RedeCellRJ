const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Criar uma nova conta bancária
exports.createBankAccount = async (req, res) => {
  const { name, bank_name, account_number, initial_balance } = req.body;

  if (!name || !bank_name || !account_number || initial_balance === undefined) {
    return res.status(400).json({ message: 'Dados da conta bancária incompletos.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO bank_accounts (name, bank_name, account_number, initial_balance, current_balance) VALUES ($1, $2, $3, $4, $4) RETURNING *;',
      [name, bank_name, account_number, initial_balance]
    );
    const bankAccount = result.rows[0];

    await logActivity(req.user.name, `Conta bancária '${name}' criada.`, 'bank_account', bankAccount.id);

    res.status(201).json(bankAccount);
  } catch (error) {
    console.error('Erro ao criar conta bancária:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Obter todas as contas bancárias
exports.getAllBankAccounts = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bank_accounts ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar contas bancárias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter uma conta bancária por ID
exports.getBankAccountById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM bank_accounts WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Conta bancária não encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar conta bancária ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar uma conta bancária
exports.updateBankAccount = async (req, res) => {
  const { id } = req.params;
  const { name, bank_name, account_number, initial_balance, current_balance } = req.body;

  try {
    const result = await db.query(
      'UPDATE bank_accounts SET name = $1, bank_name = $2, account_number = $3, initial_balance = $4, current_balance = $5, updated_at = NOW() WHERE id = $6 RETURNING *;',
      [name, bank_name, account_number, initial_balance, current_balance, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Conta bancária não encontrada.' });
    }

    await logActivity(req.user.name, `Conta bancária '${name}' (#${id}) atualizada.`, 'bank_account', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar conta bancária ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Deletar uma conta bancária
exports.deleteBankAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM bank_accounts WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Conta bancária não encontrada.' });
    }

    await logActivity(req.user.name, `Conta bancária #${id} deletada.`, 'bank_account', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar conta bancária ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Importar transações bancárias via CSV
exports.importBankTransactions = async (req, res) => {
  const { id: bank_account_id } = req.params; // ID da conta bancária
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Nenhum arquivo CSV enviado.' });
  }

  try {
    const csvContent = file.buffer.toString('utf8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
      return res.status(400).json({ message: 'Arquivo CSV vazio.' });
    }

    // Assume a header row and skips it
    const transactions = [];
    for (let i = 1; i < lines.length; i++) {
      const [transaction_date, description, amount, type] = lines[i].split(',');
      if (transaction_date && description && amount && type) {
        transactions.push({
          transaction_date: new Date(transaction_date.trim()),
          description: description.trim(),
          amount: parseFloat(amount.trim()),
          type: type.trim().toLowerCase(),
        });
      }
    }

    if (transactions.length === 0) {
      return res.status(400).json({ message: 'Nenhuma transação válida encontrada no CSV.' });
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      let totalAmountChange = 0;
      const insertValues = [];
      const insertParams = [];
      let paramCounter = 1;

      transactions.forEach(t => {
        insertValues.push(`(${paramCounter++}, ${paramCounter++}, ${paramCounter++}, ${paramCounter++}, ${paramCounter++})`);
        insertParams.push(bank_account_id, t.transaction_date, t.description, t.amount, t.type);

        if (t.type === 'credit') {
          totalAmountChange += t.amount;
        } else if (t.type === 'debit') {
          totalAmountChange -= t.amount;
        }
      });

      if (insertValues.length > 0) {
        await client.query(
          `INSERT INTO bank_transactions (bank_account_id, transaction_date, description, amount, type) VALUES ${insertValues.join(',')};`,
          insertParams
        );
      }

      // Atualizar o current_balance da conta bancária
      await client.query(
        'UPDATE bank_accounts SET current_balance = current_balance + $1, updated_at = NOW() WHERE id = $2;',
        [totalAmountChange, bank_account_id]
      );

      await client.query('COMMIT');

      await logActivity(req.user.name, `Transações importadas para a conta bancária #${bank_account_id}.`, 'bank_account', bank_account_id);
      res.status(200).json({ message: `${transactions.length} transações importadas com sucesso.` });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao importar transações bancárias:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Obter transações bancárias para uma conta específica
exports.getBankTransactions = async (req, res) => {
  const { id: bank_account_id } = req.params;
  const { start_date, end_date, reconciled, type } = req.query;

  let query = 'SELECT * FROM bank_transactions WHERE bank_account_id = $1';
  const params = [bank_account_id];
  let paramIndex = 2;

  if (start_date) {
    query += ` AND transaction_date >= ${paramIndex++}`;
    params.push(start_date);
  }
  if (end_date) {
    query += ` AND transaction_date <= ${paramIndex++}`;
    params.push(end_date);
  }
  if (reconciled !== undefined) {
    query += ` AND reconciled = ${paramIndex++}`;
    params.push(reconciled === 'true'); // Convert string to boolean
  }
  if (type) {
    query += ` AND type = ${paramIndex++}`;
    params.push(type);
  }

  query += ' ORDER BY transaction_date DESC;';

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao buscar transações bancárias para a conta ${bank_account_id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

