const db = require('../db');
const { redisClient } = require('../db');

// Função auxiliar para registrar no log de atividades
const logSettingChange = async (settingKey, oldValue, newValue, userId) => {
  try {
    await db.query(
      'INSERT INTO settings_activity_log (setting_key, old_value, new_value, changed_by_user_id) VALUES ($1, $2, $3, $4)',
      [settingKey, oldValue, newValue, userId]
    );
  } catch (logError) {
    console.error('Failed to write to settings activity log:', logError);
    // Não impede a operação principal, mas registra o erro de log.
  }
};

// Obter todas as configurações
exports.getAllSettings = async (req, res) => {
  const cacheKey = 'allSettings';
  try {
    if (redisClient && typeof redisClient.get === 'function') {
        const cachedSettings = await redisClient.get(cacheKey);
        if (cachedSettings) {
            return res.json(JSON.parse(cachedSettings));
        }
    }

    const { rows } = await db.query('SELECT key, value FROM store_settings');
    const settings = {};
    rows.forEach(row => {
      // Tenta fazer o parse de valores que são JSON/boolean/number
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });

    if (redisClient && typeof redisClient.setex === 'function') {
        await redisClient.setex(cacheKey, 3600, JSON.stringify(settings)); // Cache por 1 hora
    }
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
  const userId = req.user?.id; // Assumindo que a autenticação adiciona o user ao req

  if (!userId) {
    return res.status(401).json({ message: 'Acesso não autorizado. ID de usuário não encontrado.' });
  }

  let oldValue = null;

  try {
    // 1. Buscar o valor antigo
    const oldSetting = await db.query('SELECT value FROM store_settings WHERE key = $1', [name]);
    if (oldSetting.rows.length > 0) {
      oldValue = oldSetting.rows[0].value;
    }

    // Converte o valor para string se for um objeto/array
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;

    // 2. Atualizar o valor no banco
    const { rows } = await db.query(
      'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value RETURNING *',
      [name, valueToStore]
    );

    // 3. Invalidar o cache
    if (redisClient && typeof redisClient.del === 'function') {
        await redisClient.del('allSettings');
    }

    // 4. Registrar a alteração no log
    await logSettingChange(name, oldValue, valueToStore, userId);

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar configuração:', err);
    res.status(500).json({ message: 'Erro ao atualizar configuração.' });
  }
};

// Obter logs de auditoria de configurações
exports.getSettingsLogs = async (req, res) => {
  const { page = 1, limit = 15 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { rows } = await db.query(`
      SELECT 
        sal.id,
        sal.setting_key,
        sal.old_value,
        sal.new_value,
        sal.changed_at,
        u.name as user_name
      FROM settings_activity_log sal
      LEFT JOIN users u ON sal.changed_by_user_id = u.id
      ORDER BY sal.changed_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const { rows: totalRows } = await db.query('SELECT COUNT(*) FROM settings_activity_log');
    
    res.json({
      logs: rows,
      totalPages: Math.ceil(totalRows[0].count / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    console.error('Erro ao buscar logs de configurações:', err);
    res.status(500).json({ message: 'Erro ao buscar logs de configurações.' });
  }
};

// Manter a função original para compatibilidade, se necessário
exports.getAuditLogs = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar logs de auditoria:', err);
    res.status(500).json({ message: 'Erro ao buscar logs de auditoria.' });
  }
};