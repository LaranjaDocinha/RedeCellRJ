const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Obter todos os fornecedores
exports.getAllSuppliers = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar fornecedores:', err.message);
    res.status(500).send('Erro do Servidor');
  }
};

// Obter um fornecedor por ID
exports.getSupplierById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar fornecedor:', err.message);
    res.status(500).send('Erro do Servidor');
  }
};

// Criar um novo fornecedor
exports.createSupplier = async (req, res) => {
  const { name, contact_person, phone, email, address } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [name, contact_person, phone, email, address]
    );
    await logActivity(req.user.name, `Fornecedor ${name} (ID: ${rows[0].id}) criado.`, 'supplier', rows[0].id);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar fornecedor:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar um fornecedor
exports.updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contact_person, phone, email, address } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE suppliers SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5, updated_at = NOW() WHERE id = $6 RETURNING *;',
      [name, contact_person, phone, email, address, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado.' });
    }
    await logActivity(req.user.name, `Fornecedor ${name} (ID: ${id}) atualizado.`, 'supplier', id);
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar fornecedor:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar um fornecedor
exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM suppliers WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado.' });
    }
    await logActivity(req.user.name, `Fornecedor (ID: ${id}) excluído.`, 'supplier', id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar fornecedor:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
