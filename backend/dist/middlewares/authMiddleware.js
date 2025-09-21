import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
export const authMiddleware = {
    authenticate: (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AuthenticationError('No token provided'));
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            return next(new AuthenticationError('Invalid or expired token'));
        }
    },
    // Old role-based authorization (can be deprecated or used for simpler cases)
    authorizeRoles: (roles) => (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('User not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AuthorizationError('You do not have permission to perform this action'));
        }
        next();
    },
    // New permission-based authorization
    authorize: (action, subject) => (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('User not authenticated'));
        }
        const hasPermission = req.user.permissions.some((p) => p.action === action && p.subject === subject);
        if (!hasPermission) {
            return next(new AuthorizationError(`You do not have permission to ${action} ${subject}`));
        }
        next();
    },
};
