const pool = require('../db');
const { AppError, NotFoundError } = require('../utils/appError');

// @desc    Obter todos os templates de checklist com filtros e paginação
// @route   GET /api/checklists/templates
// @access  Private
exports.getAllTemplates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM checklist_templates';
    const queryParams = [];
    const whereClauses = [];
    let paramIndex = 1;

    if (search) {
      whereClauses.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    if (category) {
      whereClauses.push(`category = $${paramIndex++}`);
      queryParams.push(category);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY name ASC';
    queryParams.push(limit, offset);
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

    const { rows } = await pool.query(query, queryParams);

    // Contagem total para paginação
    let countQuery = 'SELECT COUNT(*) FROM checklist_templates';
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    const totalResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(totalResult.rows[0].count, 10);

    res.status(200).json({
      templates: rows,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(new AppError('Erro ao buscar templates de checklist.', 500));
  }
};

// @desc    Obter um template de checklist por ID
// @route   GET /api/checklists/templates/:id
// @access  Private
exports.getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const templateResult = await pool.query('SELECT * FROM checklist_templates WHERE id = $1', [id]);

    if (templateResult.rows.length === 0) {
      return next(new AppError('Template de checklist não encontrado.', 404));
    }
    const template = templateResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT id, item_text, response_type, display_order FROM checklist_template_items WHERE template_id = $1 ORDER BY display_order ASC',
      [id]
    );
    template.items = itemsResult.rows;

    res.status(200).json(template);
  } catch (error) {
    next(new AppError('Erro ao buscar o template de checklist.', 500));
  }
};

// @desc    Criar um novo template de checklist
// @route   POST /api/checklists/templates
// @access  Private
exports.createTemplate = async (req, res, next) => {
  const client = await pool.getClient();
  try {
    await client.query('BEGIN');

    const { name, description, category, items } = req.body;

    const templateResult = await client.query(
      'INSERT INTO checklist_templates (name, description, category) VALUES ($1, $2, $3) RETURNING *',
      [name, description, category]
    );
    const template = templateResult.rows[0];

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          'INSERT INTO checklist_template_items (template_id, item_text, response_type, display_order) VALUES ($1, $2, $3, $4)',
          [template.id, item.item_text, item.response_type, i]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Template de checklist criado com sucesso!',
      template: template
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(new AppError('Erro ao criar o template de checklist.', 500));
  } finally {
    client.release();
  }
};

// @desc    Atualizar um template de checklist
// @route   PUT /api/checklists/templates/:id
// @access  Private
exports.updateTemplate = async (req, res, next) => {
  const client = await pool.getClient();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, description, category, items } = req.body;

    const templateResult = await client.query(
      'UPDATE checklist_templates SET name = $1, description = $2, category = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, description, category, id]
    );

    if (templateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new AppError('Template de checklist não encontrado para atualização.', 404));
    }

    // Deletar itens antigos e inserir os novos (abordagem simplificada)
    await client.query('DELETE FROM checklist_template_items WHERE template_id = $1', [id]);
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          'INSERT INTO checklist_template_items (template_id, item_text, response_type, display_order) VALUES ($1, $2, $3, $4)',
          [id, item.item_text, item.response_type, i]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({
      message: 'Template de checklist atualizado com sucesso!',
      template: templateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(new AppError('Erro ao atualizar o template de checklist.', 500));
  } finally {
    client.release();
  }
};

// @desc    Deletar um template de checklist
// @route   DELETE /api/checklists/templates/:id
// @access  Private
exports.deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    // A exclusão de itens é feita em cascata pelo DB (ON DELETE CASCADE)
    const result = await pool.query('DELETE FROM checklist_templates WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return next(new AppError('Template de checklist não encontrado para exclusão.', 404));
    }

    res.status(204).send();
  } catch (error) {
    next(new AppError('Erro ao deletar o template de checklist.', 500));
  }
};