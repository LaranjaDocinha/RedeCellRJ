const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Obter todas as categorias
exports.getAllCategories = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar categorias:', err.message);
    res.status(500).send('Erro do Servidor');
  }
};

// Obter uma categoria por ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar categoria:', err.message);
    res.status(500).send('Erro do Servidor');
  }
};

// Criar uma nova categoria
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *;',
      [name, description]
    );
    await logActivity(req.user.name, `Categoria ${name} (ID: ${rows[0].id}) criada.`, 'category', rows[0].id);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar categoria:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar uma categoria
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *;',
      [name, description, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    await logActivity(req.user.name, `Categoria ${name} (ID: ${id}) atualizada.`, 'category', id);
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar uma categoria
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM categories WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    await logActivity(req.user.name, `Categoria (ID: ${id}) excluída.`, 'category', id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar categoria:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
