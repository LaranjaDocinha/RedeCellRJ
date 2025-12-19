import { getPool } from '../db/index.js';
export const createFaq = async (question, answer, category) => {
    const result = await getPool().query('INSERT INTO faqs (question, answer, category) VALUES ($1, $2, $3) RETURNING *', [question, answer, category]);
    return result.rows[0];
};
export const updateFaq = async (id, question, answer, category) => {
    const result = await getPool().query('UPDATE faqs SET question = $1, answer = $2, category = $3 WHERE id = $4 RETURNING *', [question, answer, category, id]);
    return result.rows[0];
};
export const deleteFaq = async (id) => {
    const result = await getPool().query('DELETE FROM faqs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};
export const getFaqs = async () => {
    const result = await getPool().query('SELECT * FROM faqs ORDER BY category, question');
    return result.rows;
};
export const searchFaqs = async (query) => {
    console.log(`Simulating searching FAQs for query: ${query}`);
    // In a real scenario, this would perform a full-text search on questions and answers.
    return { success: true, message: `Search results for '${query}' (simulated).`, results: [] };
};
