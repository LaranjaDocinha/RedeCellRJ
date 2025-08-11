const express = require('express');
const router = express.Router();
const {
  createChecklistTemplate,
  getAllChecklistTemplates,
  updateChecklistTemplate,
  deleteChecklistTemplate
} = require('../controllers/checklistController');
const { authenticateToken, admin } = require('../middleware/authMiddleware');

// All routes here are prefixed with /api/checklists

router.route('/templates')
  .post(authenticateToken, admin, createChecklistTemplate) // Only admins can create
  .get(authenticateToken, getAllChecklistTemplates); // Any authenticated user can view templates

router.route('/templates/:id')
  .put(authenticateToken, admin, updateChecklistTemplate) // Only admins can update
  .delete(authenticateToken, admin, deleteChecklistTemplate); // Only admins can delete

module.exports = router;
