import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as knowledgeBaseService from '../../../src/services/knowledgeBaseService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do módulo db/index.js para controlar a função `pool.query`
vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn(); // Declarado DENTRO da factory
  return {
    default: {
      query: mockQuery,
    },
  };
});

// Acessar a função query do mock de pool.
const mockedPool = pool as { query: vi.Mock };

describe('knowledgeBaseService', () => {
  beforeEach(() => {
    mockedPool.query.mockClear(); // Limpar o mockQuery antes de cada teste
  });

  // Testes para createArticle
  describe('createArticle', () => {
    it('should create an article successfully', async () => {
      const articleData = {
        title: 'Test Article',
        content: 'This is the content.',
        author_id: 1,
        tags: ['test', 'unit'],
        category: 'Development',
      };
      const expectedArticle = { id: 1, ...articleData, tags: ['test', 'unit'] };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedArticle] });

      const result = await knowledgeBaseService.createArticle(articleData);

      expect(result).toEqual(expectedArticle);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'INSERT INTO knowledge_base_articles (title, content, author_id, tags, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          articleData.title,
          articleData.content,
          articleData.author_id,
          JSON.stringify(articleData.tags),
          articleData.category,
        ],
      );
    });

    it('should create an article with default values for optional fields', async () => {
      const articleData = {
        title: 'Another Article',
        content: 'Content here.',
        author_id: 2,
      };
      const expectedArticle = { id: 2, ...articleData, tags: '[]', category: null };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedArticle] });

      const result = await knowledgeBaseService.createArticle(articleData);

      expect(result).toEqual(expectedArticle);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'INSERT INTO knowledge_base_articles (title, content, author_id, tags, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [articleData.title, articleData.content, articleData.author_id, '[]', undefined], // category is undefined when not provided
      );
    });

    it('should throw an error if database query fails', async () => {
      const articleData = {
        title: 'Error Article',
        content: 'Error content.',
        author_id: 3,
      };
      const dbError = new Error('Database error during insert');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.createArticle(articleData)).rejects.toThrow(dbError);
    });
  });

  // Testes para findArticles
  describe('findArticles', () => {
    it('should return articles matching the search text', async () => {
      const searchText = 'test';
      const mockArticles = [{ id: 1, title: 'Test Article', content: '...', tags: ['test'] }];
      mockedPool.query.mockResolvedValueOnce({ rows: mockArticles });

      const result = await knowledgeBaseService.findArticles(searchText);

      expect(result).toEqual(mockArticles);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT * FROM knowledge_base_articles WHERE title ILIKE $1 OR content ILIKE $1 OR tags::text ILIKE $1',
        [`%${searchText}%`],
      );
    });

    it('should return an empty array if no articles match', async () => {
      const searchText = 'nomatch';
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await knowledgeBaseService.findArticles(searchText);

      expect(result).toEqual([]);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const searchText = 'error';
      const dbError = new Error('Database error during search');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.findArticles(searchText)).rejects.toThrow(dbError);
    });
  });

  // Testes para getArticleById
  describe('getArticleById', () => {
    it('should return an article by its ID', async () => {
      const id = 1;
      const mockArticle = { id, title: 'Found Article', content: '...' };
      mockedPool.query.mockResolvedValueOnce({ rows: [mockArticle] });

      const result = await knowledgeBaseService.getArticleById(id);

      expect(result).toEqual(mockArticle);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT * FROM knowledge_base_articles WHERE id = $1',
        [id],
      );
    });

    it('should return undefined if article not found', async () => {
      const id = 99;
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await knowledgeBaseService.getArticleById(id);

      expect(result).toBeUndefined();
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.getArticleById(id)).rejects.toThrow(dbError);
    });
  });

  // Testes para getAllArticles
  describe('getAllArticles', () => {
    it('should return all articles ordered by creation date', async () => {
      const mockArticles = [
        { id: 1, title: 'Old Article', created_at: '2023-01-01' },
        { id: 2, title: 'New Article', created_at: '2023-01-02' },
      ];
      mockedPool.query.mockResolvedValueOnce({ rows: mockArticles });

      const result = await knowledgeBaseService.getAllArticles();

      expect(result).toEqual(mockArticles);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT * FROM knowledge_base_articles ORDER BY created_at DESC',
      );
    });

    it('should return an empty array if no articles exist', async () => {
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await knowledgeBaseService.getAllArticles();

      expect(result).toEqual([]);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.getAllArticles()).rejects.toThrow(dbError);
    });
  });

  // Testes para updateArticle
  describe('updateArticle', () => {
    it('should update an article successfully', async () => {
      const id = 1;
      const updateData = { title: 'Updated Title', category: 'Updated Category' };
      const expectedArticle = { id, ...updateData };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedArticle] });

      const result = await knowledgeBaseService.updateArticle(id, updateData);

      expect(result).toEqual(expectedArticle);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      // Regex para verificar a query UPDATE, pois a ordem dos campos pode variar
      expect(mockedPool.query).toHaveBeenCalledWith(
        expect.stringMatching(
          /^UPDATE knowledge_base_articles SET "title" = \$2, "category" = \$3, updated_at = current_timestamp WHERE id = \$1 RETURNING \*$/,
        ),
        [id, updateData.title, updateData.category],
      );
    });

    it('should return undefined if article not found for update', async () => {
      const id = 99;
      const updateData = { title: 'Non Existent' };
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await knowledgeBaseService.updateArticle(id, updateData);

      expect(result).toBeUndefined();
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 1;
      const updateData = { title: 'Error' };
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.updateArticle(id, updateData)).rejects.toThrow(dbError);
    });

    it('should update article with tags', async () => {
      const id = 1;
      const updateData = { tags: ['new', 'tags'] };
      const expectedArticle = { id, title: 'Original', content: '...', tags: ['new', 'tags'] };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedArticle] });

      const result = await knowledgeBaseService.updateArticle(id, updateData);

      expect(result).toEqual(expectedArticle);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        expect.stringMatching(
          /^UPDATE knowledge_base_articles SET "tags" = \$2, updated_at = current_timestamp WHERE id = \$1 RETURNING \*$/,
        ),
        [id, updateData.tags],
      );
    });
  });

  // Testes para deleteArticle
  describe('deleteArticle', () => {
    it('should delete an article successfully', async () => {
      const id = 1;
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id }] });

      const result = await knowledgeBaseService.deleteArticle(id);

      expect(result).toBe(true);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'DELETE FROM knowledge_base_articles WHERE id = $1 RETURNING id',
        [id],
      );
    });

    it('should return false if article not found for deletion', async () => {
      const id = 99;
      mockedPool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await knowledgeBaseService.deleteArticle(id);

      expect(result).toBe(false);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.deleteArticle(id)).rejects.toThrow(dbError);
    });
  });

  // Testes para createAttachment
  describe('createAttachment', () => {
    it('should create an attachment successfully', async () => {
      const attachmentData = {
        article_id: 1,
        file_url: 'http://example.com/file.pdf',
        file_type: 'application/pdf',
        description: 'Test attachment',
      };
      const expectedAttachment = { id: 101, ...attachmentData };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedAttachment] });

      const result = await knowledgeBaseService.createAttachment(attachmentData);

      expect(result).toEqual(expectedAttachment);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'INSERT INTO knowledge_base_attachments (article_id, file_url, file_type, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          attachmentData.article_id,
          attachmentData.file_url,
          attachmentData.file_type,
          attachmentData.description,
        ],
      );
    });

    it('should throw an error if database query fails', async () => {
      const attachmentData = {
        article_id: 1,
        file_url: 'http://example.com/file.pdf',
        file_type: 'application/pdf',
      };
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.createAttachment(attachmentData)).rejects.toThrow(dbError);
    });
  });

  // Testes para getAttachmentsByArticleId
  describe('getAttachmentsByArticleId', () => {
    it('should return attachments for a given article ID', async () => {
      const articleId = 1;
      const mockAttachments = [{ id: 101, article_id: 1, file_url: '...' }];
      mockedPool.query.mockResolvedValueOnce({ rows: mockAttachments });

      const result = await knowledgeBaseService.getAttachmentsByArticleId(articleId);

      expect(result).toEqual(mockAttachments);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT * FROM knowledge_base_attachments WHERE article_id = $1 ORDER BY created_at',
        [articleId],
      );
    });

    it('should return an empty array if no attachments found', async () => {
      const articleId = 99;
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await knowledgeBaseService.getAttachmentsByArticleId(articleId);

      expect(result).toEqual([]);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const articleId = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.getAttachmentsByArticleId(articleId)).rejects.toThrow(
        dbError,
      );
    });
  });

  // Testes para getAttachmentById
  describe('getAttachmentById', () => {
    it('should return an attachment by its ID', async () => {
      const id = 101;
      const mockAttachment = { id, article_id: 1, file_url: '...' };
      mockedPool.query.mockResolvedValueOnce({ rows: [mockAttachment] });

      const result = await knowledgeBaseService.getAttachmentById(id);

      expect(result).toEqual(mockAttachment);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT * FROM knowledge_base_attachments WHERE id = $1',
        [id],
      );
    });

    it('should return undefined if attachment not found', async () => {
      const id = 999;
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await knowledgeBaseService.getAttachmentById(id);

      expect(result).toBeUndefined();
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 101;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.getAttachmentById(id)).rejects.toThrow(dbError);
    });
  });

  // Testes para updateAttachment
  describe('updateAttachment', () => {
    it('should update an attachment successfully', async () => {
      const id = 101;
      const updateData = { file_url: 'http://new.url/file.png', description: 'Updated desc' };
      const expectedAttachment = { id, article_id: 1, ...updateData };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedAttachment] });

      const result = await knowledgeBaseService.updateAttachment(id, updateData);

      expect(result).toEqual(expectedAttachment);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        expect.stringMatching(
          /^UPDATE knowledge_base_attachments SET "file_url" = \$2, "description" = \$3, updated_at = current_timestamp WHERE id = \$1 RETURNING \*$/,
        ),
        [id, updateData.file_url, updateData.description],
      );
    });

    it('should return undefined if attachment not found for update', async () => {
      const id = 999;
      const updateData = { file_type: 'image/jpeg' };
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await knowledgeBaseService.updateAttachment(id, updateData);

      expect(result).toBeUndefined();
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 101;
      const updateData = { description: 'Error' };
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.updateAttachment(id, updateData)).rejects.toThrow(dbError);
    });
  });

  // Testes para deleteAttachment
  describe('deleteAttachment', () => {
    it('should delete an attachment successfully', async () => {
      const id = 101;
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id }] });

      const result = await knowledgeBaseService.deleteAttachment(id);

      expect(result).toBe(true);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'DELETE FROM knowledge_base_attachments WHERE id = $1 RETURNING id',
        [id],
      );
    });

    it('should return false if attachment not found for deletion', async () => {
      const id = 999;
      mockedPool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await knowledgeBaseService.deleteAttachment(id);

      expect(result).toBe(false);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 101;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(knowledgeBaseService.deleteAttachment(id)).rejects.toThrow(dbError);
    });
  });
});
