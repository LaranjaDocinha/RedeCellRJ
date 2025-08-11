const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

// Obter todos os produtos
router.get('/', [authenticateToken, authorize('products:read')], productController.getAllProducts);

// Obter um produto por ID
router.get('/:id', [authenticateToken, authorize('products:read')], productController.getProductById);

// Criar um novo produto
router.post('/', [authenticateToken, authorize('products:create')], productController.createProduct);

// Atualizar um produto
router.put('/:id', [authenticateToken, authorize('products:update')], productController.updateProduct);

// Deletar um produto
router.delete('/:id', [authenticateToken, authorize('products:delete')], productController.deleteProduct);

// Obter produtos com estoque baixo
router.get('/low-stock', [authenticateToken, authorize('products:read')], productController.getLowStockProducts);

// Rotas para Importação/Exportação
router.post('/import', [authenticateToken, authorize('products:create')], productController.importProducts);
router.get('/export', [authenticateToken, authorize('products:read')], productController.exportProducts);

module.exports = router;