const express = require('express');
const router = express.Router();
console.log('[NotificationRoutes] Loaded');
const { authenticateToken } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Obter notificações para o usuário logado
router.get('/', (req, res, next) => {
  console.log('[NotificationRoutes] GET / called');
  next();
}, authenticateToken, notificationController.getNotifications);

// Marcar notificações como lidas
router.post('/mark-read', authenticateToken, notificationController.markAsRead);
// Marcar uma notificação específica como lida
router.post('/:id/mark-read', authenticateToken, notificationController.markNotificationAsRead);
// Deletar uma notificação específica
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);

// Temporary test route to create a notification (REMOVE IN PRODUCTION)
router.post('/test-create', authenticateToken, async (req, res) => {
  try {
    const { message, type, entity_id } = req.body;
    const userId = req.user.id; // Assuming the user is authenticated
    const newNotification = await notificationController.createNotification(userId, message || 'Test Notification', type || 'generic', entity_id);
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ message: 'Failed to create test notification.' });
  }
});

module.exports = router;