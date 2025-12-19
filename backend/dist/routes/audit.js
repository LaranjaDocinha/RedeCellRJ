import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { auditService } from '../services/auditService.js';
const auditRouter = Router();
auditRouter.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Audit'), async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const logs = await auditService.getAuditLogs(limit, offset);
        res.json(logs);
    }
    catch (error) {
        next(error);
    }
});
export default auditRouter;
