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

module.exports = router;