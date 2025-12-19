import { getPool } from '../db/index.js';
export const createBadge = async (badgeData) => {
    const { name, description, icon_url, metric, threshold } = badgeData;
    const result = await getPool().query('INSERT INTO badges (name, description, icon_url, metric, threshold) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, icon_url, metric, threshold]);
    return result.rows[0];
};
export const getAllBadges = async () => {
    const result = await getPool().query('SELECT * FROM badges');
    return result.rows;
};
export const getBadgeById = async (id) => {
    const result = await getPool().query('SELECT * FROM badges WHERE id = $1', [id]);
    return result.rows[0];
};
export const updateBadge = async (id, badgeData) => {
    const { name, description, icon_url, metric, threshold } = badgeData;
    const result = await getPool().query('UPDATE badges SET name = $1, description = $2, icon_url = $3, metric = $4, threshold = $5, updated_at = current_timestamp WHERE id = $6 RETURNING *', [name, description, icon_url, metric, threshold, id]);
    return result.rows[0];
};
export const deleteBadge = async (id) => {
    await getPool().query('DELETE FROM badges WHERE id = $1', [id]);
};
