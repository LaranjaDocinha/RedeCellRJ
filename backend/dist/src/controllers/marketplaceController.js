import { getPool } from '../db/index.js';
export const getIntegrations = async (req, res) => {
    try {
        const result = await getPool().query('SELECT id, platform, shop_id, is_active, last_synced_at FROM marketplace_integrations');
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const saveIntegration = async (req, res) => {
    const { platform, access_token, shop_id, is_active } = req.body;
    try {
        // Simple UPSERT logic based on platform unique constraint
        const query = `
      INSERT INTO marketplace_integrations (platform, access_token, shop_id, is_active, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (platform) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        shop_id = EXCLUDED.shop_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING id, platform, shop_id, is_active;
    `;
        const result = await getPool().query(query, [platform, access_token, shop_id, is_active]);
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const toggleIntegration = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        const result = await getPool().query('UPDATE marketplace_integrations SET is_active = $1 WHERE id = $2 RETURNING id, is_active', [is_active, id]);
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
