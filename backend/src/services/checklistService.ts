import pool from '../db/index.js';
import { z } from 'zod';

// Esquemas de validação com Zod
const createChecklistTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  type: z.enum(['pre-repair', 'post-repair', 'general']).default('general'),
});

const updateChecklistTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['pre-repair', 'post-repair', 'general']).optional(),
});

const createChecklistTemplateItemSchema = z.object({
  template_id: z.number().int(),
  item_text: z.string().min(1),
  response_type: z.enum(['text', 'boolean', 'number']).default('text'),
  order_index: z.number().int().min(0).optional(),
});

const updateChecklistTemplateItemSchema = z.object({
  item_text: z.string().min(1).optional(),
  response_type: z.enum(['text', 'boolean', 'number']).optional(),
  order_index: z.number().int().min(0).optional(),
});

type CreateChecklistTemplatePayload = z.infer<typeof createChecklistTemplateSchema>;
type UpdateChecklistTemplatePayload = z.infer<typeof updateChecklistTemplateSchema>;
type CreateChecklistTemplateItemPayload = z.infer<typeof createChecklistTemplateItemSchema>;
type UpdateChecklistTemplateItemPayload = z.infer<typeof updateChecklistTemplateItemSchema>;

// Export schemas for use in controllers if needed
export {
  createChecklistTemplateSchema,
  updateChecklistTemplateSchema,
  createChecklistTemplateItemSchema,
  updateChecklistTemplateItemSchema,
};

export const getChecklistTemplateWithItems = async (templateId: number) => {
  const templateRes = await pool.query('SELECT * FROM checklist_templates WHERE id = $1', [
    templateId,
  ]);
  if (templateRes.rows.length === 0) return null;

  const itemsRes = await pool.query(
    'SELECT * FROM checklist_template_items WHERE template_id = $1 ORDER BY order_index, id',
    [templateId],
  );

  return { ...templateRes.rows[0], items: itemsRes.rows };
};

export const saveChecklistAnswers = async (
  serviceOrderId: number,
  userId: number,
  answers: { template_item_id: number; answer: string }[],
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const ans of answers) {
      await client.query(
        `
        INSERT INTO service_order_checklist_answers (service_order_id, template_item_id, answer, checked_by_user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (service_order_id, template_item_id) 
        DO UPDATE SET answer = EXCLUDED.answer, checked_by_user_id = EXCLUDED.checked_by_user_id, updated_at = current_timestamp;
      `,
        [serviceOrderId, ans.template_item_id, ans.answer, userId],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Funções CRUD para checklist_templates
export const createChecklistTemplate = async (data: CreateChecklistTemplatePayload) => {
  const { name, description, type } = data;
  const res = await pool.query(
    'INSERT INTO checklist_templates (name, description, type) VALUES ($1, $2, $3) RETURNING *',
    [name, description, type],
  );
  return res.rows[0];
};

export const getChecklistTemplateById = async (id: number) => {
  const res = await pool.query('SELECT * FROM checklist_templates WHERE id = $1', [id]);
  return res.rows[0];
};

export const getAllChecklistTemplates = async () => {
  const res = await pool.query('SELECT * FROM checklist_templates ORDER BY name');
  return res.rows;
};

export const updateChecklistTemplate = async (id: number, data: UpdateChecklistTemplatePayload) => {
  const fields = Object.keys(data)
    .map((key, index) => `"${key}" = $${index + 2}`)
    .join(', ');
  const values = Object.values(data);
  const res = await pool.query(
    `UPDATE checklist_templates SET ${fields}, updated_at = current_timestamp WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return res.rows[0];
};

export const deleteChecklistTemplate = async (id: number) => {
  const res = await pool.query('DELETE FROM checklist_templates WHERE id = $1 RETURNING id', [id]);
  return (res.rowCount ?? 0) > 0;
};

// Funções CRUD para checklist_template_items
export const createChecklistTemplateItem = async (data: CreateChecklistTemplateItemPayload) => {
  const { template_id, item_text, response_type, order_index } = data;
  const res = await pool.query(
    'INSERT INTO checklist_template_items (template_id, item_text, response_type, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
    [template_id, item_text, response_type, order_index],
  );
  return res.rows[0];
};

export const getChecklistTemplateItemById = async (id: number) => {
  const res = await pool.query('SELECT * FROM checklist_template_items WHERE id = $1', [id]);
  return res.rows[0];
};

export const getChecklistTemplateItemsByTemplateId = async (templateId: number) => {
  const res = await pool.query(
    'SELECT * FROM checklist_template_items WHERE template_id = $1 ORDER BY order_index, id',
    [templateId],
  );
  return res.rows;
};

export const updateChecklistTemplateItem = async (
  id: number,
  data: UpdateChecklistTemplateItemPayload,
) => {
  const fields = Object.keys(data)
    .map((key, index) => `"${key}" = $${index + 2}`)
    .join(', ');
  const values = Object.values(data);
  const res = await pool.query(
    `UPDATE checklist_template_items SET ${fields}, updated_at = current_timestamp WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return res.rows[0];
};

export const deleteChecklistTemplateItem = async (id: number) => {
  const res = await pool.query('DELETE FROM checklist_template_items WHERE id = $1 RETURNING id', [
    id,
  ]);
  return (res.rowCount ?? 0) > 0;
};
