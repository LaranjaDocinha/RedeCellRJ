const pool = require('../db');

// @desc    Create a new checklist template with its items
// @route   POST /api/checklists/templates
// @access  Private/Admin
const createChecklistTemplate = async (req, res) => {
  const { name, description, category, items } = req.body;

  if (!name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Template name and at least one item are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const templateQuery = 'INSERT INTO checklist_templates (name, description, category) VALUES ($1, $2, $3) RETURNING id';
    const templateResult = await client.query(templateQuery, [name, description, category]);
    const templateId = templateResult.rows[0].id;

    const itemQuery = 'INSERT INTO checklist_template_items (template_id, item_text, response_type, display_order) VALUES ($1, $2, $3, $4)';
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await client.query(itemQuery, [templateId, item.item_text, item.response_type, i]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Template created successfully', templateId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error while creating template.' });
  } finally {
    client.release();
  }
};

// @desc    Get all checklist templates with their items
// @route   GET /api/checklists/templates
// @access  Private
const getAllChecklistTemplates = async (req, res) => {
  try {
    const templatesResult = await pool.query('SELECT * FROM checklist_templates ORDER BY name');
    const itemsResult = await pool.query('SELECT * FROM checklist_template_items ORDER BY template_id, display_order');

    const templates = templatesResult.rows.map(template => ({
      ...template,
      items: itemsResult.rows.filter(item => item.template_id === template.id)
    }));

    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching templates.' });
  }
};

// @desc    Update a checklist template and its items
// @route   PUT /api/checklists/templates/:id
// @access  Private/Admin
const updateChecklistTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, items } = req.body;

  if (!name || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Template name and items are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const templateQuery = 'UPDATE checklist_templates SET name = $1, description = $2, category = $3, updated_at = NOW() WHERE id = $4';
    await client.query(templateQuery, [name, description, category, id]);

    // Simple approach: delete old items and insert new ones
    await client.query('DELETE FROM checklist_template_items WHERE template_id = $1', [id]);

    const itemQuery = 'INSERT INTO checklist_template_items (template_id, item_text, response_type, display_order) VALUES ($1, $2, $3, $4)';
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await client.query(itemQuery, [id, item.item_text, item.response_type, i]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Template updated successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error while updating template.' });
  } finally {
    client.release();
  }
};

// @desc    Delete a checklist template
// @route   DELETE /api/checklists/templates/:id
// @access  Private/Admin
const deleteChecklistTemplate = async (req, res) => {
  const { id } = req.params;

  try {
    // The ON DELETE CASCADE will handle deleting associated items
    await pool.query('DELETE FROM checklist_templates WHERE id = $1', [id]);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error(error);
    // Check for foreign key violation if template is in use
    if (error.code === '23503') {
        return res.status(400).json({ message: 'Cannot delete template because it is currently in use by one or more repairs.' });
    }
    res.status(500).json({ message: 'Server error while deleting template.' });
  }
};


module.exports = {
  createChecklistTemplate,
  getAllChecklistTemplates,
  updateChecklistTemplate,
  deleteChecklistTemplate
};
