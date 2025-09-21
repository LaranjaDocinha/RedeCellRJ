var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/categoryService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const categoriesRouter = Router();
// Zod Schemas
const createCategorySchema = z.object({
    name: z.string().trim().nonempty('Category name is required'),
    description: z.string().trim().optional(),
});
const updateCategorySchema = z.object({
    name: z.string().trim().nonempty('Category name cannot be empty').optional(),
    description: z.string().trim().optional(),
}).partial();
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
categoriesRouter.use(authMiddleware.authenticate);
// Get all categories
categoriesRouter.get('/', authMiddleware.authorize('read', 'Category'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield categoryService.getAllCategories();
        res.status(200).json(categories);
    }
    catch (error) {
        next(error);
    }
}));
// Get category by ID
categoriesRouter.get('/:id', authMiddleware.authorize('read', 'Category'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield categoryService.getCategoryById(parseInt(req.params.id));
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new category
categoriesRouter.post('/', authMiddleware.authorize('create', 'Category'), validate(createCategorySchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCategory = yield categoryService.createCategory(req.body);
        res.status(201).json(newCategory);
    }
    catch (error) {
        next(error);
    }
}));
// Update a category by ID
categoriesRouter.put('/:id', authMiddleware.authorize('update', 'Category'), validate(updateCategorySchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedCategory = yield categoryService.updateCategory(parseInt(req.params.id), req.body);
        if (!updatedCategory) {
            throw new AppError('Category not found', 404);
        }
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a category by ID
categoriesRouter.delete('/:id', authMiddleware.authorize('delete', 'Category'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield categoryService.deleteCategory(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Category not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default categoriesRouter;
