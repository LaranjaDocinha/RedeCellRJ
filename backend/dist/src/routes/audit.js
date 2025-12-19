import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { auditService } from '../services/auditService.js';
import { z } from 'zod'; // Importar Zod
import { ValidationError } from '../utils/errors.js'; // Importar ValidationError
const auditRouter = Router();
// Zod Schema para os query parameters de logs de auditoria
const getAuditLogsQuerySchema = z.object({
    limit: z.preprocess((val) => parseInt(val, 10), z.number().int().positive()).default(100),
    offset: z.preprocess((val) => parseInt(val, 10), z.number().int().nonnegative()).default(0),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    action: z.string().optional(),
    userId: z.string().optional(),
    startDate: z.string().datetime().optional(), // Novo filtro
    endDate: z.string().datetime().optional(), // Novo filtro
});
// Validation Middleware (reutilizado do search.ts, pode ser movido para um common/middleware)
const validateQuery = (schema) => (req, res, next) => {
    try {
        req.query = schema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
auditRouter.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Audit'), validateQuery(getAuditLogsQuerySchema), // Aplicar validação
async (req, res, next) => {
    try {
        const { limit, offset, entityType, entityId, action, userId, startDate, endDate } = req.query;
        const filters = {
            limit, offset, entityType, entityId, action, userId, startDate, endDate,
        };
        const { logs, totalCount } = await auditService.getAuditLogs(filters); // Chamar com um objeto filters
        res.status(200).json({ logs, totalCount }); // Retornar logs e totalCount
    }
    catch (error) {
        next(error);
    }
});
export default auditRouter;
