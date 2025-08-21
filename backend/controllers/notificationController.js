const pool = require('../db');
const { io } = require('../index'); // Import the Socket.IO instance

/**
 * Busca as notificações para o usuário logado.
 */
const getNotifications = async (req, res) => {
  console.log('[NotificationController] getNotifications called.');
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT id, message, type, read_status, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows } = await pool.query(query, [userId, limit, offset]);

    const countQuery = `
      SELECT COUNT(*)
      FROM notifications
      WHERE user_id = $1;
    `;
    const { rows: countRows } = await pool.query(countQuery, [userId]);
    const totalNotifications = parseInt(countRows[0].count, 10);

    res.json({
      notifications: rows,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
    });
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

  try {
    let query;
    let params;

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      query = `
        UPDATE notifications
        SET read_status = TRUE
        WHERE user_id = $1 AND id = ANY($2::int[]) AND read_status = FALSE;
      `;
      params = [userId, notificationIds];
    } else {
      // Mark all unread notifications for the user as read
      query = `
        UPDATE notifications
        SET read_status = TRUE
        WHERE user_id = $1 AND read_status = FALSE;
      `;
      params = [userId];
    }

    await pool.query(query, params);
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar notificações.' });
  }
};

/**
 * Busca o número de notificações não lidas para o usuário logado.
 */
const getUnreadCount = async (req, res) => {
  console.log('[NotificationController] getUnreadCount called.');
  console.log('req.user:', req.user);
  if (!req.user || !req.user.id) {
    console.error('[NotificationController] getUnreadCount: req.user or req.user.id is missing.');
    return res.status(401).json({ message: 'Não autorizado: Usuário não autenticado.' });
  }
  const userId = req.user.id;
  try {
    const query = `
      SELECT COUNT(*)
      FROM notifications
      WHERE user_id = $1 AND read_status = FALSE;
    `;
    const { rows } = await pool.query(query, [userId]);
    res.json({ unreadCount: parseInt(rows[0].count, 10) });
  } catch (error) {
    console.error('Erro ao buscar contagem de notificações não lidas:', error);
    res.status(500).json({ message: 'Erro interno ao buscar contagem de notificações não lidas.' });
  }
};

/**
 * Marca uma notificação específica como lida.
 */
const markNotificationAsRead = async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  try {
    const query = `
      UPDATE notifications
      SET read_status = TRUE
      WHERE id = $1 AND user_id = $2 AND read_status = FALSE;
    `;
    const { rowCount } = await pool.query(query, [notificationId, userId]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Notificação não encontrada ou já lida.' });
    }

    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ message: 'Erro interno ao marcar notificação como lida.' });
  }
};

/**
 * Deleta uma notificação específica.
 */
const deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  try {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2;
    `;
    const { rowCount } = await pool.query(query, [notificationId, userId]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Notificação não encontrada.' });
    }

    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ message: 'Erro interno ao deletar notificação.' });
  }
};

/**
 * Cria uma nova notificação e a envia via Socket.IO.
 */
const createNotification = async (userId, message, type, entityId = null) => {
  try {
    const query = `
      INSERT INTO notifications (user_id, message, type, entity_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, message, type, read_status, created_at, entity_id;
    `;
    const { rows } = await pool.query(query, [userId, message, type, entityId]);
    const newNotification = rows[0];

    // Emitir a notificação via Socket.IO para o usuário específico
    // Em um cenário real, você precisaria de um mapeamento de userId para socket.id
    // Por enquanto, vamos emitir para todos os sockets conectados (para fins de demonstração)
    // ou para um "room" específico do usuário se o mapeamento estiver configurado.
    io.emit(`notification:${userId}`, newNotification); // Emit to a user-specific room/event
    io.emit('newNotification', newNotification); // Generic event for all connected clients

    return newNotification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw new Error('Erro ao criar notificação.');
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  getUnreadCount,
  markNotificationAsRead,
  deleteNotification,
  createNotification, // Export the new function
};
