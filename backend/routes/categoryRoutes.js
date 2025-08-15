const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');

// Obter todas as categorias
router.get('/', categoryController.getAllCategories);

// Criar uma nova categoria
router.post('/', [authenticateToken, authorize('products:create')], categoryController.createCategory);

// Atualizar uma categoria
router.put('/:id', [authenticateToken, authorize('products:update')], categoryController.updateCategory);

// Deletar uma categoria
router.delete('/:id', [authenticateToken, authorize('products:delete')], categoryController.deleteCategory);

module.exports = router;