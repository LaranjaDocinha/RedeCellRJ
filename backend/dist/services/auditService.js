var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from '../db/index.js';
class AuditService {
    recordAuditLog(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, action, entityType, entityId, details } = payload;
            try {
                yield pool.query('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)', [userId, action, entityType, entityId, details]);
            }
            catch (error) {
                console.error('Failed to record audit log:', error);
                // Depending on criticality, you might want to throw the error or handle it silently
            }
        });
    }
    getAuditLogs() {
        return __awaiter(this, arguments, void 0, function* (limit = 100, offset = 0) {
            const result = yield pool.query('SELECT al.*, u.email as user_email FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY timestamp DESC LIMIT $1 OFFSET $2', [limit, offset]);
            return result.rows;
        });
    }
}
export const auditService = new AuditService();
