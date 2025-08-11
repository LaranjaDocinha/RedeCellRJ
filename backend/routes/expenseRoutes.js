
const express = require('express');
const router = express.Router();
const { 
    getAllExpenses,
    createExpense,
    updateExpense,
    deleteExpense 
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas aqui são protegidas
router.use(authMiddleware.authenticateToken);

router.route('/')
    .get(getAllExpenses)
    .post(createExpense);

router.route('/:id')
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;
