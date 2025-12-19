import { Router } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/categoryService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js'; // Importar cacheMiddleware
const categoriesRouter = Router();
// Zod Schemas
const createCategorySchema = z.object({
    name: z.string().trim().nonempty('Category name is required'),
    description: z.string().trim().optional(),
});
const updateCategorySchema = z
    .object({
    name: z.string().trim().nonempty('Category name cannot be empty').optional(),
    description: z.string().trim().optional(),
})
    .partial();
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
categoriesRouter.use(authMiddleware.authenticate);
// Get all categories
categoriesRouter.get('/', authMiddleware.authorize('read', 'Category'), cacheMiddleware(), // Aplicar cacheMiddleware aqui
async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json(categories);
    }
    catch (error) {
        next(error);
    }
});
// Get category by ID
categoriesRouter.get('/:id', authMiddleware.authorize('read', 'Category'), async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(parseInt(req.params.id));
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
});
// Create a new category
categoriesRouter.post('/', authMiddleware.authorize('create', 'Category'), validate(createCategorySchema), async (req, res, next) => {
    try {
        const newCategory = await categoryService.createCategory(req.body);
        res.status(201).json(newCategory);
    }
    catch (error) {
        next(error);
    }
});
// Update a category by ID
categoriesRouter.put('/:id', authMiddleware.authorize('update', 'Category'), validate(updateCategorySchema), async (req, res, next) => {
    try {
        const updatedCategory = await categoryService.updateCategory(parseInt(req.params.id), req.body);
        if (!updatedCategory) {
            throw new AppError('Category not found', 404);
        }
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        next(error);
    }
});
// Delete a category by ID
categoriesRouter.delete('/:id', authMiddleware.authorize('delete', 'Category'), async (req, res, next) => {
    try {
        const deleted = await categoryService.deleteCategory(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Category not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
export default categoriesRouter;
