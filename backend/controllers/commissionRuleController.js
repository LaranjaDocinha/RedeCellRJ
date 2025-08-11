const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Criar uma nova regra de comissão
exports.createCommissionRule = async (req, res) => {
  const { role_id, commission_type, value, applies_to, start_date, end_date } = req.body;

  if (!role_id || !commission_type || value === undefined || !applies_to) {
    return res.status(400).json({ message: 'Dados da regra de comissão incompletos.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO commission_rules (role_id, commission_type, value, applies_to, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [role_id, commission_type, value, applies_to, start_date || null, end_date || null]
    );
    const rule = result.rows[0];

    await logActivity(req.user.name, `Regra de comissão #${rule.id} criada.`, 'commission_rule', rule.id);

    res.status(201).json(rule);
  } catch (error) {
    console.error('Erro ao criar regra de comissão:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Obter todas as regras de comissão
exports.getAllCommissionRules = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT cr.*, r.name as role_name FROM commission_rules cr JOIN roles r ON cr.role_id = r.id ORDER BY cr.id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar regras de comissão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter uma regra de comissão por ID
exports.getCommissionRuleById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT cr.*, r.name as role_name FROM commission_rules cr JOIN roles r ON cr.role_id = r.id WHERE cr.id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Regra de comissão não encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar regra de comissão ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar uma regra de comissão
exports.updateCommissionRule = async (req, res) => {
  const { id } = req.params;
  const { role_id, commission_type, value, applies_to, start_date, end_date } = req.body;

  try {
    const result = await db.query(
      'UPDATE commission_rules SET role_id = $1, commission_type = $2, value = $3, applies_to = $4, start_date = $5, end_date = $6, updated_at = NOW() WHERE id = $7 RETURNING *;',
      [role_id, commission_type, value, applies_to, start_date || null, end_date || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Regra de comissão não encontrada.' });
    }

    await logActivity(req.user.name, `Regra de comissão #${id} atualizada.`, 'commission_rule', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar regra de comissão ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Deletar uma regra de comissão
exports.deleteCommissionRule = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM commission_rules WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Regra de comissão não encontrada.' });
    }

    await logActivity(req.user.name, `Regra de comissão #${id} deletada.`, 'commission_rule', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar regra de comissão ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};