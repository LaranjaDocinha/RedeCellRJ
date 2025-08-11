const db = require('../db');
const { redisClient } = require('../db');

// Obter todas as configurações
exports.getAllSettings = async (req, res) => {
  const cacheKey = 'allSettings';
  try {
    const cachedSettings = await redisClient.get(cacheKey);
    if (cachedSettings) {
      return res.json(JSON.parse(cachedSettings));
    }

    const { rows } = await db.query('SELECT key, value FROM store_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    await redisClient.setex(cacheKey, 3600, JSON.stringify(settings)); // Cache por 1 hora
    res.json(settings);
  } catch (err) {
    console.error('Erro ao buscar configurações:', err);
    res.status(500).json({ message: 'Erro ao buscar configurações.' });
  }
};

// Atualizar uma configuração
exports.updateSetting = async (req, res) => {
  const { name } = req.params;
  const { value } = req.body;
  console.log(`Attempting to update setting: ${name} with value: ${value}`);
  try {
    const { rows } = await db.query(
      'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value RETURNING *'
      , [name, value]
    );
    await redisClient.del('allSettings'); // Invalida o cache
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar configuração:', err);
    res.status(500).json({ message: 'Erro ao atualizar configuração.' });
  }
};

// Obter logs de auditoria
exports.getAuditLogs = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar logs de auditoria:', err);
    res.status(500).json({ message: 'Erro ao buscar logs de auditoria.' });
  }
};
