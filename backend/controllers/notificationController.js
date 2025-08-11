const pool = require('../db');

/**
 * Busca as notificações para o usuário logado.
 */
const getNotifications = async (req, res) => {
  console.log('[NotificationController] getNotifications called.');
  const userId = req.user.id;
  try {
    const query = `
      SELECT id, message, type, link, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20; -- Limita a um número razoável de notificações recentes
    `;
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro interno ao buscar notificações.' });
  }
};

/**
 * Marca as notificações como lidas.
 */
const markAsRead = async (req, res) => {
  const userId = req.user.id;
  const { notificationIds } = req.body; // Espera um array de IDs

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ message: 'IDs de notificação inválidos.' });
  }

  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, updated_at = NOW()
      WHERE user_id = $1 AND id = ANY($2::int[]) AND is_read = FALSE;
    `;
    await pool.query(query, [userId, notificationIds]);
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar notificações.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
