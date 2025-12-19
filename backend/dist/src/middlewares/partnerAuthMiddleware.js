import pool from '../db/index.js';
export const partnerAuthMiddleware = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'API Key is missing' });
    }
    const result = await pool.query('SELECT * FROM api_keys WHERE api_key = $1 AND is_active = true', [apiKey]);
    if (result.rows.length === 0) {
        return res.status(403).json({ message: 'Invalid API Key' });
    }
    req.partner = result.rows[0];
    next();
};
