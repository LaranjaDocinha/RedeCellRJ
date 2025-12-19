import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
class SettingsService {
    /**
     * Returns a structured, categorized list of settings for the new frontend.
     * This is temporarily hardcoded. In the future, this should be driven by the database.
     */
    async getAllSettings() {
        // This mimics fetching all settings and then structuring them.
        // The actual values could be fetched from the DB and merged into this structure.
        const dbSettings = {};
        const dbResult = await pool.query('SELECT key, value FROM settings');
        dbResult.rows.forEach((row) => {
            dbSettings[row.key] = row.value;
        });
        const settings = {
            // ... (profile, general, appearance, notifications categories)
            inventory: {
                title: 'Inventário',
                icon: 'Box', // You might need to add this icon to the frontend map
                settings: [
                    {
                        key: 'inventory_valuation_method',
                        value: dbSettings['inventory_valuation_method'] || 'average_cost',
                        type: 'select',
                        label: 'Método de Valorização de Estoque',
                        description: 'O método contábil usado para calcular o valor do seu estoque.',
                        options: [
                            { value: 'average_cost', label: 'Custo Médio Ponderado' },
                            { value: 'fifo', label: 'PEPS (Primeiro a Entrar, Primeiro a Sair)' },
                        ],
                    },
                ],
            },
            security: {
                title: 'Segurança',
                icon: 'Lock',
                settings: [], // Adicione configurações de segurança aqui quando houver
            },
        };
        return Promise.resolve(settings);
    }
    async getSettingByKey(key) {
        const result = await pool.query('SELECT * FROM settings WHERE key = $1', [key]);
        return result.rows[0];
    }
    async createSetting(payload) {
        const { key, value, description } = payload;
        try {
            const result = await pool.query('INSERT INTO settings (key, value, description) VALUES ($1, $2, $3) RETURNING *', [key, value, description]);
            return result.rows[0];
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('Setting with this key already exists', 409);
            }
            throw error;
        }
    }
    async updateSetting(key, payload) {
        const { value, description } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (value !== undefined) {
            fields.push(`value = $${paramIndex++}`);
            values.push(value);
        }
        if (description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (fields.length === 0) {
            return this.getSettingByKey(key);
        }
        values.push(key);
        const query = `UPDATE settings SET ${fields.join(', ')}, updated_at = current_timestamp WHERE key = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    async deleteSetting(key) {
        const result = await pool.query('DELETE FROM settings WHERE key = $1 RETURNING key', [key]);
        return (result?.rowCount ?? 0) > 0;
    }
}
export const settingsService = new SettingsService();
