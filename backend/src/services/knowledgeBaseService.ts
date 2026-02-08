import pool from '../db/index.js';
import { z } from 'zod';

// Esquemas de validação com Zod (para uso interno do serviço, se necessário)
const createArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  author_id: z.number().int(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
});

const createAttachmentSchema = z.object({
  article_id: z.number().int(),
  file_url: z.string().url(),
  file_type: z.string().min(1),
  description: z.string().optional().nullable(),
});

const updateAttachmentSchema = z.object({
  file_url: z.string().url().optional(),
  file_type: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
});

type CreateArticlePayload = z.infer<typeof createArticleSchema>;
type UpdateArticlePayload = z.infer<typeof updateArticleSchema>;
type CreateAttachmentPayload = z.infer<typeof createAttachmentSchema>;
type UpdateAttachmentPayload = z.infer<typeof updateAttachmentSchema>;

export { createArticleSchema, updateArticleSchema, createAttachmentSchema, updateAttachmentSchema };

export const createArticle = async (data: CreateArticlePayload) => {
  const { title, content, author_id, tags, category } = data;
  const result = await pool.query(
    'INSERT INTO knowledge_base_articles (title, content, author_id, tags, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, content, author_id, JSON.stringify(tags || []), category],
  );
  return result.rows[0];
};

export const findArticles = async (searchText: string) => {
  const result = await pool.query(
    'SELECT * FROM knowledge_base_articles WHERE title ILIKE $1 OR content ILIKE $1 OR tags::text ILIKE $1',
    [`%${searchText}%`],
  );
  return result.rows;
};

// Funções CRUD para knowledge_base_articles
export const getArticleById = async (id: number) => {
  const res = await pool.query('SELECT * FROM knowledge_base_articles WHERE id = $1', [id]);
  return res.rows[0];
};

export const getAllArticles = async () => {
  const res = await pool.query('SELECT * FROM knowledge_base_articles ORDER BY created_at DESC');
  return res.rows;
};

export const updateArticle = async (id: number, data: UpdateArticlePayload) => {
  const fields = Object.keys(data)
    .map((key, index) => `"${key}" = $${index + 2}`)
    .join(', ');
  const values = Object.values(data);
  const res = await pool.query(
    `UPDATE knowledge_base_articles SET ${fields}, updated_at = current_timestamp WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return res.rows[0];
};

export const deleteArticle = async (id: number) => {
  const res = await pool.query('DELETE FROM knowledge_base_articles WHERE id = $1 RETURNING id', [
    id,
  ]);
  return (res.rowCount ?? 0) > 0;
};

// Funções CRUD para knowledge_base_attachments
export const createAttachment = async (data: CreateAttachmentPayload) => {
  const { article_id, file_url, file_type, description } = data;
  const res = await pool.query(
    'INSERT INTO knowledge_base_attachments (article_id, file_url, file_type, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [article_id, file_url, file_type, description],
  );
  return res.rows[0];
};

export const getAttachmentsByArticleId = async (articleId: number) => {
  const res = await pool.query(
    'SELECT * FROM knowledge_base_attachments WHERE article_id = $1 ORDER BY created_at',
    [articleId],
  );
  return res.rows;
};

export const getAttachmentById = async (id: number) => {
  const res = await pool.query('SELECT * FROM knowledge_base_attachments WHERE id = $1', [id]);
  return res.rows[0];
};

export const updateAttachment = async (id: number, data: UpdateAttachmentPayload) => {
  const fields = Object.keys(data)
    .map((key, index) => `"${key}" = $${index + 2}`)
    .join(', ');
  const values = Object.values(data);
  const res = await pool.query(
    `UPDATE knowledge_base_attachments SET ${fields}, updated_at = current_timestamp WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return res.rows[0];
};

export const deleteAttachment = async (id: number) => {
  const res = await pool.query(
    'DELETE FROM knowledge_base_attachments WHERE id = $1 RETURNING id',
    [id],
  );
  return (res.rowCount ?? 0) > 0;
};
