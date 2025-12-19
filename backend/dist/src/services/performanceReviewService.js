import { getPool } from '../db/index.js';
export const createPerformanceReview = async (reviewData) => {
    const { user_id, reviewer_id, review_date, goals, strengths, areas_for_improvement, overall_rating, comments, status, } = reviewData;
    const result = await getPool().query('INSERT INTO performance_reviews (user_id, reviewer_id, review_date, goals, strengths, areas_for_improvement, overall_rating, comments, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [
        user_id,
        reviewer_id,
        review_date,
        goals,
        strengths,
        areas_for_improvement,
        overall_rating,
        comments,
        status,
    ]);
    return result.rows[0];
};
export const getPerformanceReviews = async (userId, reviewerId) => {
    let query = 'SELECT pr.*, u.name as user_name, r.name as reviewer_name FROM performance_reviews pr JOIN users u ON pr.user_id = u.id JOIN users r ON pr.reviewer_id = r.id';
    const params = [];
    if (userId) {
        query += ' WHERE pr.user_id = $1';
        params.push(userId);
    }
    else if (reviewerId) {
        query += ' WHERE pr.reviewer_id = $1';
        params.push(reviewerId);
    }
    const result = await getPool().query(query, params);
    return result.rows;
};
export const getPerformanceReviewById = async (id) => {
    const result = await getPool().query('SELECT pr.*, u.name as user_name, r.name as reviewer_name FROM performance_reviews pr JOIN users u ON pr.user_id = u.id JOIN users r ON pr.reviewer_id = r.id WHERE pr.id = $1', [id]);
    return result.rows[0];
};
export const updatePerformanceReview = async (id, reviewData) => {
    const { user_id, reviewer_id, review_date, goals, strengths, areas_for_improvement, overall_rating, comments, status, } = reviewData;
    const result = await getPool().query('UPDATE performance_reviews SET user_id = $1, reviewer_id = $2, review_date = $3, goals = $4, strengths = $5, areas_for_improvement = $6, overall_rating = $7, comments = $8, status = $9 WHERE id = $10 RETURNING *', [
        user_id,
        reviewer_id,
        review_date,
        goals,
        strengths,
        areas_for_improvement,
        overall_rating,
        comments,
        status,
        id,
    ]);
    return result.rows[0];
};
export const deletePerformanceReview = async (id) => {
    await getPool().query('DELETE FROM performance_reviews WHERE id = $1', [id]);
};
