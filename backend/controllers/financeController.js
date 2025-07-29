const db = require('../db');

// Contas a Pagar
exports.getAllPayables = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM accounts_payable ORDER BY due_date ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPayable = async (req, res) => {
  const { description, amount, due_date, status } = req.body;
  if (!description || !amount || !due_date) {
    return res.status(400).json({ message: 'Description, amount, and due date are required.' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO accounts_payable (description, amount, due_date, status) VALUES ($1, $2, $3, $4) RETURNING *'
      , [description, amount, due_date, status || 'pending']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding payable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePayable = async (req, res) => {
  const { id } = req.params;
  const { description, amount, due_date, status } = req.body;
  if (!description || !amount || !due_date || !status) {
    return res.status(400).json({ message: 'Description, amount, due date, and status are required.' });
  }
  try {
    const { rows } = await db.query(
      'UPDATE accounts_payable SET description = $1, amount = $2, due_date = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *'
      , [description, amount, due_date, status, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Payable not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating payable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePayable = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM accounts_payable WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Payable not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Contas a Receber
exports.getAllReceivables = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM accounts_receivable ORDER BY due_date ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching receivables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createReceivable = async (req, res) => {
  const { description, amount, due_date, status } = req.body;
  if (!description || !amount || !due_date) {
    return res.status(400).json({ message: 'Description, amount, and due date are required.' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO accounts_receivable (description, amount, due_date, status) VALUES ($1, $2, $3, $4) RETURNING *'
      , [description, amount, due_date, status || 'pending']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding receivable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateReceivable = async (req, res) => {
  const { id } = req.params;
  const { description, amount, due_date, status } = req.body;
  if (!description || !amount || !due_date || !status) {
    return res.status(400).json({ message: 'Description, amount, due date, and status are required.' });
  }
  try {
    const { rows } = await db.query(
      'UPDATE accounts_receivable SET description = $1, amount = $2, due_date = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *'
      , [description, amount, due_date, status, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Receivable not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating receivable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteReceivable = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM accounts_receivable WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Receivable not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting receivable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
