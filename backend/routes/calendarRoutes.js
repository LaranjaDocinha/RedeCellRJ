
const express = require('express');
const router = express.Router();
const { getCalendarEvents } = require('../controllers/calendarController');
const authMiddleware = require('../middleware/authMiddleware');

// @desc    Obter todos os eventos (vendas e reparos) para o calendário
// @route   GET /api/calendar/events
// @access  Private
router.get('/events', authMiddleware.authenticateToken, getCalendarEvents);

module.exports = router;
