const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Obter todos os leads
exports.getAllLeads = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar leads:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Obter um lead por ID
exports.getLeadById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lead não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar lead:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Criar um novo lead
exports.createLead = async (req, res) => {
  const { name, email, phone, source, status, notes } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO leads (name, email, phone, source, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [name, email, phone, source, status, notes]
    );
    await logActivity(req.user.name, `Lead ${name} (ID: ${rows[0].id}) criado.`, 'lead', rows[0].id);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar lead:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar um lead
exports.updateLead = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, source, status, notes } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE leads SET name = $1, email = $2, phone = $3, source = $4, status = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *;',
      [name, email, phone, source, status, notes, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lead não encontrado.' });
    }
    await logActivity(req.user.name, `Lead ${name} (ID: ${id}) atualizado.`, 'lead', id);
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar lead:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar um lead
exports.deleteLead = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM leads WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Lead não encontrado.' });
    }
    await logActivity(req.user.name, `Lead (ID: ${id}) excluído.`, 'lead', id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar lead:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
