import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as faqService from '../../../src/services/faqService.js';
import { getPool } from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  return {
    getPool: vi.fn(() => ({
      query: mockQuery,
    })),
  };
});

describe('faqService', () => {
  const mockPool = getPool();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createFaq should insert a new FAQ', async () => {
    const mockFaq = { id: 1, question: 'Q', answer: 'A', category: 'General' };
    (mockPool.query as any).mockResolvedValueOnce({ rows: [mockFaq] });

    const result = await faqService.createFaq('Q', 'A', 'General');
    expect(result).toEqual(mockFaq);
    expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO faqs'), [
      'Q',
      'A',
      'General',
    ]);
  });

  it('updateFaq should update an FAQ', async () => {
    const mockFaq = { id: 1, question: 'Q2', answer: 'A2' };
    (mockPool.query as any).mockResolvedValueOnce({ rows: [mockFaq] });

    const result = await faqService.updateFaq(1, 'Q2', 'A2');
    expect(result).toEqual(mockFaq);
    expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE faqs'), [
      'Q2',
      'A2',
      undefined,
      1,
    ]);
  });

  it('deleteFaq should delete an FAQ', async () => {
    (mockPool.query as any).mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const result = await faqService.deleteFaq(1);
    expect(result).toEqual({ id: 1 });
    expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM faqs'), [1]);
  });

  it('getFaqs should return all FAQs', async () => {
    (mockPool.query as any).mockResolvedValueOnce({ rows: [] });
    const result = await faqService.getFaqs();
    expect(result).toEqual([]);
    expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM faqs'));
  });

  it('searchFaqs should return simulated results', async () => {
    const result = await faqService.searchFaqs('test');
    expect(result.success).toBe(true);
    expect(result.results).toEqual([]);
  });
});
