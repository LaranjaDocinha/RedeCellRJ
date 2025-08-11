const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Obter todos os métodos de pagamento
exports.getAllPaymentMethods = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM payment_methods ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar métodos de pagamento:', err.message);
    res.status(500).send('Erro do Servidor');
  }
};

// Obter um método de pagamento por ID
exports.getPaymentMethodById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM payment_methods WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Método de pagamento não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar método de pagamento:', err.message);
    res.status(500).send('Erro do Servidor');
  }
};

// Criar um novo método de pagamento
exports.createPaymentMethod = async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO payment_methods (name, description) VALUES ($1, $2) RETURNING *;',
      [name, description]
    );
    await logActivity(req.user.name, `Método de pagamento ${name} (ID: ${rows[0].id}) criado.`, 'payment_method', rows[0].id);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar método de pagamento:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar um método de pagamento
exports.updatePaymentMethod = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE payment_methods SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *;',
      [name, description, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Método de pagamento não encontrado.' });
    }
    await logActivity(req.user.name, `Método de pagamento ${name} (ID: ${id}) atualizado.`, 'payment_method', id);
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar método de pagamento:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar um método de pagamento
exports.deletePaymentMethod = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM payment_methods WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Método de pagamento não encontrado.' });
    }
    await logActivity(req.user.name, `Método de pagamento (ID: ${id}) excluído.`, 'payment_method', id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar método de pagamento:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
