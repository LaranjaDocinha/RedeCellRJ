import { Router } from 'express';
import { z } from 'zod';
import { NotFoundError } from '../utils/errors.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // Import auth middleware
import { productService } from '../services/productService.js';
import { auditService } from '../services/auditService.js'; // Import auditService
// Zod Schemas
const variationSchema = z.object({
    id: z.number().int().positive().optional(),
    color: z.string().trim().nonempty('Cor é obrigatória'),
    price: z.coerce.number().positive('Preço deve ser positivo'),
    stock_quantity: z.coerce.number().int().min(0, 'Estoque não pode ser negativo'),
    low_stock_threshold: z.coerce
        .number()
        .int()
        .min(0, 'Alerta de estoque não pode ser negativo')
        .optional(),
});
const createProductSchema = z.object({
    name: z.string().trim().nonempty('Nome do produto é obrigatório'),
    branch_id: z.coerce.number().positive('A valid branch ID is required'),
    sku: z.string().trim().nonempty('SKU é obrigatório'),
    // product_type: z.string().nonempty('Tipo de produto é obrigatório'), // Removido
    variations: z.array(variationSchema).min(1, 'Adicione pelo menos uma variação'),
    // is_used?: boolean; // Removido
    // condition: z.string().optional().nullable(), // Removido
    // acquisition_date: z.string().datetime().optional().nullable(), // Removido
});
const updateProductSchema = z.object({
    name: z.string().trim().nonempty('Product name cannot be empty').optional(),
    branch_id: z.coerce.number().positive('A valid branch ID is required').optional(),
    variations: z.array(variationSchema).optional(),
    // is_used?: boolean; // Removido
    // condition?: string; // Removido
    // acquisition_date?: string; // Removido
});
import { validate } from '../middlewares/validationMiddleware.js';
const createProductRouter = () => {
    const router = Router();
    // Rotas que exigem autenticação
    router.use(authMiddleware.authenticate);
    router.use(authMiddleware.authorize('manage', 'Product')); // Permissão geral para gerenciar produtos
    router.get('/', async (req, res, next) => {
        try {
            const products = await productService.getAllProducts();
            res.status(200).json(products);
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/', validate(createProductSchema), async (req, res, next) => {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json(newProduct);
        // Audit Log (temporariamente desativado para testes de integração)
        // auditService.recordAuditLog({
        //   userId: (req as any).user?.id,
        //   action: 'CREATE',
        //   // entityType: 'Product', // Removido
        //   // entityId: newProduct.id,
        //   details: newProduct,
        // });
    });
    router.get('/:id', async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFoundError('Invalid product ID');
            }
            const product = await productService.getProductById(id);
            if (product) {
                res.status(200).json(product);
            }
            else {
                throw new NotFoundError('Product not found');
            }
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:productId/variations/:variationId/price-history', async (req, res, next) => {
        try {
            const productId = parseInt(req.params.productId);
            const variationId = parseInt(req.params.variationId);
            if (isNaN(productId) || isNaN(variationId)) {
                throw new NotFoundError('Invalid product ID or variation ID');
            }
            const priceHistory = await productService.getProductPriceHistory(productId, variationId);
            res.status(200).json(priceHistory);
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:id/suggested-used-price', async (req, res, next) => {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                throw new NotFoundError('Invalid product ID');
            }
            const suggestedPrice = await productService.getSuggestedUsedProductPrice(productId);
            if (suggestedPrice !== null) {
                res.status(200).json({ suggested_price: suggestedPrice });
            }
            else {
                res.status(404).json({ message: 'Product not found or not a used product' });
            }
        }
        catch (error) {
            next(error);
        }
    });
    router.put('/:id', validate(updateProductSchema), async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFoundError('Invalid product ID');
            }
            const updatedProduct = await productService.updateProduct(id, req.body);
            if (updatedProduct) {
                res.status(200).json(updatedProduct);
                // Audit Log (temporariamente desativado para testes de integração)
                // auditService.recordAuditLog({
                //   userId: (req as any).user?.id,
                //   action: 'UPDATE',
                //   entityType: 'Product',
                //   entityId: updatedProduct ? (updatedProduct.id as number) : undefined,
                //   details: { oldData: req.body, newData: updatedProduct }, // You might want to fetch old data for a more complete log
                // });
            }
            else {
                throw new NotFoundError('Product not found');
            }
        }
        catch (error) {
            next(error);
        }
    });
    router.delete('/:id', async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFoundError('Invalid product ID');
            }
            const deleted = (await productService.deleteProduct(id));
            if (deleted) {
                res.status(204).send();
                // Audit Log
                auditService.recordAuditLog({
                    userId: req.user?.id,
                    action: 'DELETE',
                    // entityType: 'Product',
                    // entityId: id,
                    details: { productId: id, entityType: 'Product' },
                });
            }
            else {
                throw new NotFoundError('Product not found');
            }
        }
        catch (error) {
            next(error);
        }
    });
    return router;
};
export { createProductRouter };
