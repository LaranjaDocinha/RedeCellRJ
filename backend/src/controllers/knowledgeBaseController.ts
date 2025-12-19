import { Request, Response } from 'express';
import * as knowledgeBaseService from '../services/knowledgeBaseService.js';
import { z } from 'zod';

// Esquemas de validação com Zod
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



export const createArticle = async (req: Request, res: Response) => {
  try {
    const validatedData = createArticleSchema.parse(req.body);
    const newArticle = await knowledgeBaseService.createArticle(validatedData);
    res.status(201).json(newArticle);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const article = await knowledgeBaseService.getArticleById(id);
    if (!article) {
      return res.status(404).json({ message: 'Artigo não encontrado.' });
    }
    res.status(200).json(article);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles = await knowledgeBaseService.getAllArticles();
    res.status(200).json(articles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const validatedData = updateArticleSchema.parse(req.body);
    const updatedArticle = await knowledgeBaseService.updateArticle(id, validatedData);
    if (!updatedArticle) {
      return res.status(404).json({ message: 'Artigo não encontrado.' });
    }
    res.status(200).json(updatedArticle);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const deleted = await knowledgeBaseService.deleteArticle(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Artigo não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const findArticles = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Parâmetro de busca 'q' é obrigatório." });
    }
    const articles = await knowledgeBaseService.findArticles(query);
    res.status(200).json(articles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Funções CRUD para attachments
export const createAttachment = async (req: Request, res: Response) => {
  try {
    const validatedData = createAttachmentSchema.parse(req.body);
    const newAttachment = await knowledgeBaseService.createAttachment(validatedData);
    res.status(201).json(newAttachment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getAttachmentsByArticleId = async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId, 10);
    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'ID de Artigo inválido.' });
    }
    const attachments = await knowledgeBaseService.getAttachmentsByArticleId(articleId);
    res.status(200).json(attachments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const deleted = await knowledgeBaseService.deleteAttachment(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Anexo não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
