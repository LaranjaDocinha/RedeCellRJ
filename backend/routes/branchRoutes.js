
const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const branchController = require('../controllers/branchController');

// @desc    Obter todas as filiais
// @route   GET /api/branches
// @access  Private (Admin only)
router.get('/', [authenticateToken, authorize('admin')], branchController.getAllBranches);

module.exports = router;
