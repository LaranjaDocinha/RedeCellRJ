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
import { userService } from '../services/userService.js'; // Changed from customerService
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const usersRouter = Router(); // Changed from customersRouter
// Zod Schemas
const createUserSchema = z.object({
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Invalid email format').nonempty('Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long').nonempty('Password is required'),
    role: z.string().optional(),
});
const updateUserSchema = z.object({
    name: z.string().nonempty('Name cannot be empty').optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    role: z.string().optional(),
});
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
usersRouter.get(// Changed from customersRouter
'/', authMiddleware.authenticate, authMiddleware.authorize('read', 'User'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userService.getAllUsers(); // Changed from customerService
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
}));
usersRouter.get(// Changed from customersRouter
'/:id', authMiddleware.authenticate, authMiddleware.authorize('read', 'User'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getUserById(parseInt(req.params.id)); // Changed from customerService
        if (!user) {
            throw new AppError('User not found', 404); // Changed from Customer
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
}));
usersRouter.post(// Changed from customersRouter
'/', authMiddleware.authenticate, authMiddleware.authorize('create', 'User'), validate(createUserSchema), // Changed from createCustomerSchema
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = yield userService.createUser(req.body); // Changed from customerService
        res.status(201).json(newUser);
    }
    catch (error) {
        next(error);
    }
}));
usersRouter.put(// Changed from customersRouter
'/:id', authMiddleware.authenticate, authMiddleware.authorize('update', 'User'), validate(updateUserSchema), // Changed from updateCustomerSchema
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield userService.updateUser(parseInt(req.params.id), req.body); // Changed from customerService
        if (!updatedUser) {
            throw new AppError('User not found', 404); // Changed from Customer
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
}));
usersRouter.delete(// Changed from customersRouter
'/:id', authMiddleware.authenticate, authMiddleware.authorize('delete', 'User'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield userService.deleteUser(parseInt(req.params.id)); // Changed from customerService
        if (!deleted) {
            throw new AppError('User not found', 404); // Changed from Customer
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export { usersRouter }; // Changed from customersRouter
