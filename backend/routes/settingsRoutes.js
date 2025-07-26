const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Proteger todas as rotas de configurações para administradores
router.use(authenticateToken, authorizeRoles('admin'));

// GET /api/settings - Obter todas as configurações da loja
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT key, value FROM store_settings');
        // Transforma o array de {key, value} em um objeto {key: value}
        const settings = result.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(settings);
    } catch (err) {
        console.error('Erro ao buscar configurações:', err.message);
        res.status(500).send('Erro do Servidor');
    }
});

// PUT /api/settings - Atualizar configurações da loja
router.put('/', async (req, res) => {
    const settings = req.body; // Espera um objeto { key: value, ... }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        for (const key in settings) {
            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                const value = settings[key];
                await client.query(
                    `INSERT INTO store_settings (key, value)
                     VALUES ($1, $2)
                     ON CONFLICT (key) DO UPDATE SET
                        value = EXCLUDED.value,
                        updated_at = CURRENT_TIMESTAMP`,
                    [key, value]
                );
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Configurações atualizadas com sucesso.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar configurações:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
});

module.exports = router;
